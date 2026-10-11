# SnapShare Scaling Plan

SnapShare is a photo-sharing app. Users upload photos and scroll a feed of photos from the people they follow. This plan estimates the load and describes an architecture that can handle it.

## 1. Assumptions

Starting facts:

- 10 million registered users
- 10% of them are active each day
- Each active user uploads 1 photo per day
- Each active user views 50 feed pages per day
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail

My own assumptions to turn these into numbers:

- Activity is spread evenly over 24 hours (86,400 seconds per day) for the **average**. The **peak** is 5 times the average.
- Storage sizes use decimal units: 1 MB = 1,000,000 bytes and 1 TB = 1,000,000 MB.
- Photos are never deleted, so storage only grows.
- One feed page shows thumbnails. The full 2 MB photo is only downloaded when a user opens it.

**Daily active users (DAU):** 10,000,000 × 10% = **1,000,000 users per day**

## 2. Estimates

| What | Calculation | Average | Peak (5×) |
| --- | --- | --- | --- |
| Uploads per day | 1,000,000 users × 1 photo | 1,000,000 | |
| Uploads per second | 1,000,000 ÷ 86,400 | **about 11.6 / s** | **about 58 / s** |
| Feed views per day | 1,000,000 users × 50 pages | 50,000,000 | |
| Feed views per second | 50,000,000 ÷ 86,400 | **about 579 / s** | **about 2,900 / s** |

**Photo storage per year**

- One photo plus its thumbnail: 2 MB + 0.05 MB = 2.05 MB
- Per day: 1,000,000 photos × 2.05 MB = 2,050,000 MB = **2.05 TB per day**
- Per year: 2.05 TB × 365 = **about 748 TB per year** (roughly 0.75 PB)
  - Original photos: 730 TB per year
  - Thumbnails: 18.25 TB per year

Two extra numbers that matter for the design:

- **Upload bandwidth:** about 11.6 uploads per second × 2 MB = about 23 MB/s on average, and about 116 MB/s at peak.
- **Database size:** if each photo's details (owner, time, caption, file location) take about 1 KB, the database grows only about 365 GB per year. That is tiny compared with the 748 TB of photo files.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. There are 50 feed views for every 1 upload, a ratio of **50 : 1**, and the gap is even bigger in bytes, because every feed view loads many images.

What this means for the design:

- Most of the effort goes into making reads fast and cheap: a CDN for images, a cache for feeds and a read replica of the database.
- Reads can be spread over many copies of the data, because a feed that is a few seconds old is acceptable.
- The write path (uploading) stays simple and quick. Slow work, such as making thumbnails, is moved off it into the background.
- Storage, not request rate, is the biggest growth problem on the write side: about 748 TB of new files every year.

## 4. Why photos should not be stored in the database

- **Size:** photos are large binary files. 748 TB per year inside a database would make it huge, slow to back up and slow to copy to replicas.
- **Cost:** database storage is much more expensive per GB than object storage.
- **Performance:** sending 2 MB files through the database ties up connections and memory that are needed for fast queries.
- **No CDN:** a CDN can serve files from object storage directly, but it cannot serve them from inside a database.

**Instead:** store the photo files (originals and thumbnails) in **object storage**, which is cheap, very durable and built for huge numbers of files. The database keeps only the small details about each photo, including the **key (location)** of its files in object storage.

## 5. Architecture diagram

```text
                    +---------------------------+
                    |  Users (mobile app / web) |
                    +-----+-------------+-------+
                          |             |
          API requests    |             |   image downloads
       (feed, upload)     |             |   (thumbnails, photos)
                          v             v
                +-----------------+  +---------+
                |  Load balancer  |  |   CDN   |
                +--------+--------+  +----+----+
                         |                |
                         v                | cache miss
                +-----------------+       |
                |  App servers    |       |
                |  (many copies)  |       |
                +--+----+------+--+       |
                   |    |      |          |
         +---------+    |      +-----+    |
         |              |            |    |
         v              v            v    v
   +-----------+  +-----------+  +-----------------------+
   |   Cache   |  |   Queue   |  |    Object storage     |
   +-----+-----+  +-----+-----+  | originals+thumbnails  |
         |              |        +-----------^-----------+
         | cache miss   v                    |
         v        +-----------+              |
   +-----------+  |  Worker   |--------------+
   | Database  |  | (makes    |  reads original,
   | (primary) |  | thumbnail)|  writes thumbnail
   +-----+-----+  +-----------+
         |
         | replication
         v
   +-----------+
   |   Read    |
   |  replica  |
   +-----------+

   Writes (new photo details)  -> Database (primary)
   Feed reads on a cache miss  -> Read replica
```

## 6. What each component does

- **CDN:** it keeps copies of thumbnails and photos in servers close to users, so images load quickly and most image traffic never reaches our own servers.
- **Load balancer:** it spreads incoming requests across many app servers, so no single server is overloaded and one failing server does not take the app down.
- **App servers:** they run the SnapShare logic (login, uploads, feeds) and can be copied (scaled out) to handle more users.
- **Cache:** it keeps recently built feeds and popular data in fast memory, so the database does not have to answer the same question thousands of times.
- **Database (primary):** it is the single trusted place that stores users, follows and photo details, and it receives all the writes.
- **Read replica:** it is a live copy of the primary that answers read queries, so feed reads do not slow down the writes.
- **Object storage:** it stores the huge number of photo files cheaply and safely, so the database does not have to hold them.
- **Queue:** it holds jobs such as "make a thumbnail for photo 123", so the upload request does not have to wait for slow work to finish.
- **Worker:** it takes jobs from the queue and creates the 50 KB thumbnails in the background, so thumbnail work can be scaled up or down independently of the app servers.

## 7. Upload flow, step by step

1. The user picks a photo in the app, and the app sends it to SnapShare through the **load balancer**.
2. The load balancer passes the request to one of the **app servers**.
3. The app server checks that the user is logged in and that the file is a valid image of an allowed size.
4. The app server saves the **original photo** in **object storage** and gets back its storage key.
5. The app server saves the photo's details (owner, time, caption, storage key and status "processing") in the **database primary**.
6. The app server adds a "create thumbnail" job (photo id and storage key) to the **queue**.
7. The app server replies to the user straight away ("uploaded"), so the user does not wait for the thumbnail.
8. A **worker** takes the job from the queue, reads the original from object storage, creates the 50 KB thumbnail and saves it back in object storage.
9. The worker updates the photo's row in the database to status "ready" and records the thumbnail key. If the job fails, it is retried, and jobs that keep failing are set aside for investigation.
10. The relevant feed entries in the **cache** are refreshed or expire, so followers see the new photo. Their apps load its thumbnail through the **CDN**.

## 8. Trade-offs

- **Caching and the CDN make reads fast, but data can be out of date.** A feed or image may be a few seconds or minutes old, and deciding when to refresh cached data is hard. We accept this because a slightly stale feed is fine for photo sharing. The cache and CDN also add running costs.
- **A read replica spreads the read load, but it can lag behind.** The replica copies the primary with a small delay, so a user might upload a photo and not see it in their own feed straight away. We can reduce this by showing a user's own new photos from the primary or the cache.
- **Making thumbnails in the background keeps uploads fast, but the thumbnail is not ready instantly.** The app has to show a placeholder or the original for a moment, and the queue and workers are extra parts that need monitoring and retry handling.
- **Keeping photos in object storage is cheap and scalable, but it splits the data across two systems.** If the file is saved but the database insert fails (or the other way round), we can end up with orphaned files or broken links, so the upload flow has to clean up after failures.

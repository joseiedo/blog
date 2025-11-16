---
title: The basics of servers network communication
description: ""
date: 2025-09-20
tags:
  - network
  - web
image: ""
draft: false
authors:
  - iedo
---
# it's all about sockets
_most of the time_

A **socket** is an **abstraction** provided by the operating system that lets applications **send and receive data** across a network (or locally)

For example, every time a computer accesses a website they are both communicating through *sockets*. The website server opens a *listening socket* and the user opens another socket to communicate!

```
RANDOM WEBSITE                                  USER
======                                          ======

Step 1: Create socket                           Step 1: Create socket
┌─────────────┐                                 ┌─────────────┐
│   Socket    │                                 │   Socket    │
│   (empty)   │                                 │   (empty)   │
└─────────────┘                                 └─────────────┘
      ↓                                               ↓

Step 2: Bind to port 8080                    Step 2: Connect to port 8080
┌─────────────┐                                 ┌─────────────┐
│   Socket    │                                 │   Socket    │
│  Port 8080  │                                 │ Random port │───┐
└─────────────┘                                 └─────────────┘   │
      ↓                                                           │
Step 3: Start listening                                           │
┌─────────────┐                                                   │
│   Socket    │                                                   │
│  Port 8080  │  ←────────────────────────────────────────────────┘
│ 👂 WAITING  │              Connection!
└─────────────┘
      ↓
Step 4: Accept connection                       Step 3: Connected!
Creates NEW socket:                             ┌─────────────┐
┌─────────────┐                                 │   Socket    │
│   Socket    │  ←─────── CONNECTED! ────────→  │  Connected  │
│  Connected  │                                 │  to 8080    │
└─────────────┘                                 └─────────────┘
```

On Linux with GNOME, your apps (Firefox, Discord, etc.) don't talk directly to the screen. They send their graphical data to a **display server** (X11 server or Wayland compositor like Mutter). The display server is responsible for actually compositing and displaying the final image on your monitor. GNOME sits on top of that as the desktop environment, using the display server to draw panels, menus, and manage windows

What I'm saying is that **sockets** are a way for any server to communicate. It doesn't need to be a website only.

*there are other ways for local servers to communicate but I'm not detailing here*
## Protocols
In network we have many protocols, which is a fancy way to say *contracts* or *conventions*. We have TCP and UDP that are ways to define how the data is delivered.
For example, TCP focuses more on consistency than fast-delivery while UDP sacrifices consistency to have fast-delivery.

On top of them we have HTTP, gRPC, GraphQL which are protocols defining how the data is structured.

```
Application Layer:  HTTP, gRPC, FTP, SMTP, DNS
                    ↓ (what the data means)
                    
Transport Layer:    TCP, UDP  
                    ↓ (how to deliver it)
                    
Network Layer:      IP
                    ↓ (where to send it)
                    
Physical Layer:     Ethernet, WiFi, etc.
```

You can read the RFCs for each protocol on internet. 

## Creating sockets
Open 2 terminals and run these commands:

**Terminal 1: Server**
```
nc -l 1234
```

**Terminal 2: Client**
```
nc localhost 1234
```

Now, if you write anything in **Terminal 2** you will notice that everything will appear in **Terminal 1**. This is because the `nc` utility displays the received data :)

If you have [cURL](https://curl.se/) installed, you can run the following command in another terminal:

```
curl localhost:1234
```

If you  open the server terminal (**terminal 1**) the following data will show up:
```
iedo@Mac ~ % nc -l 1234
GET / HTTP/1.1
Host: localhost:1234
User-Agent: curl/8.7.1
Accept: */*
```

That's how HTTP defines their data structure :)

## Things to note
If you want to participate in performance-focused challenges like [Rinha de backend](https://github.com/zanfranceschi/rinha-de-backend-2025) you may notice that some protocols are slower than others and maybe it's necessary to use pure sockets. 

The [TOP 1 for the 2025 Rinha](https://ricassiocosta.me/2025/08/como-venci-a-rinha-de-backend-2025/) used pure sockets for his server and Redis communication. 

It's about trade-offs, and it's very fun to break the rules for these types of challenges :)

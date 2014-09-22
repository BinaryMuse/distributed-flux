:construction:

Initial tests in using a [Flux](http://facebook.github.io/flux/)-style architecture for realtime, multi-client programs.

    npm install && npm start

Overview
========

Flux is a software architecture where changes to local data comes only from events, called actions. Entities that manage data, called stores, watch for these actions and manipulate their internal state as appropriate.

This repository demonstrates a similar idea distributed among a server and *n* clients. When an action is performed on a client, it is also sent to the server. The server determines a canonical order for all incoming actions, and informs the clients of that order. Clients jump back in time (using immutable data structures) if necessary and reply all subsequent actions to bring themselves up to date with the server, re-applying any actions that haven't yet been confirmed by the server if necessary.

This example uses a "last-write-wins" approach. Conflict resolution mechanisms are an interesting topic warranting further exploration.

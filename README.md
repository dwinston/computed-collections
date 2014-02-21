# Computed Collections

I want to sort documents in a collection based on keys that are not persisted in the documents (because they e.g. depend on the current user, the user's current location, and the current time) and publish only the first N of them (e.g., using a limit option on a cursor that also has a sort option) so as to not overload the client with data.

This repository is a failed attempt to publish a Meteor.Collection cursor with sort and limit options, where the sort is a function of the arguments with which the client subscribes. Because sort specifiers take collection object keys as input, I create a new local collection within the publish function that extends the persistent collection's objects with computed key-value pairs. Returning a cursor of this new collection with the desired sort and limit options fails because `Error: Can't publish a cursor from a collection without a name.`. I do not want to synchronize the new collection because it is ephemeral, particular to the client subscription that depends on the user, the user's location, and the current time.

I appreciate any advice via github issues, pull requests, or direct reply to [my post](https://groups.google.com/forum/?fromgroups#!forum/meteor-talk) on `meteor-talk`.

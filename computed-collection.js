Games = new Meteor.Collection("games");

if (Meteor.isClient) {
  Session.setDefault("position", 0);
  Meteor.loginWithPassword("joe-user", "foobar");

  Deps.autorun(function () {
    Meteor.subscribe("games", Session.get("position"));
  });

  Template.games.helpers({
    games: function () {
      return Games.find({},{sort: {relevance: -1, timeFromNow: 1}});
    },
    involvement: function () {
      return (_.contains(this.players, Meteor.userId())) ?
        "playing" : "not playing";
    },
    distance: function () {
      return Math.abs(this.position - Session.get("position")).toFixed(1);
    },
    when: function () {
      if (this.startsAt < Date.now()) {
        return "happened " + moment(this.startsAt).fromNow();
      } else {
        return "will happen " + moment(this.startsAt).fromNow();
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Meteor.users.find().count() === 0) {
      var joeId = Accounts.createUser({
        username: "joe-user", password: "foobar"
      });
      _.times(100, function () {
        Games.insert({
          position: 100 * (Random.fraction() - 0.5),
          players: (Random.fraction() > 0.9) ? [joeId] : [],
          startsAt: +moment().add('hours', 48 * (Random.fraction() - 0.5))
        });
      });
    }
  });

  Meteor.publish("games", function (position) {
    var self = this;
    var RelevantGames = new Meteor.Collection(null);
    var handle = Games.find({
      $or: [{'players': self.userId},
            {'position': {$gte: position - 10}},
            {'position': {$lte: position + 10}}]
    }).observeChanges({
      added: function (id, fields) {
        RelevantGames.insert(_.extend(fields, {
          // extensible to several levels of relevance
          relevance: ((fields.startsAt > Date.now()) ? 10 : 0)
            + ((_.contains(fields.players, self.userId)) ? 1 : 0),
          timeFromNow: Math.abs(fields.startsAt - Date.now())
        }));
      }
      // I realize this is not a complete solution, having only
      // an `added` callback. However, I think the code as is illustrates
      // the meat of my problem.
    });
    self.onStop(function () { handle.stop(); });
    return RelevantGames.find({}, {
      sort: {relevance: -1, timeFromNow: 1},
      limit: 20
    });
  });
}

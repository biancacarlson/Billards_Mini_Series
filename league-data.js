// ============================================================
//  WEEKLY UPDATE FILE  -  edit this file each week, then commit.
//
//  1. TEAMS:  replace "Team 1" ... with real team names.
//     (pf / pa are no longer used; standings use wins, then head-to-head.)
//  2. REGULAR SEASON: each line is ONE GAME. After a game, change
//     win: null  to the winning team's NUMBER (the position in the
//     TEAMS list, 1-12). The score is optional, like:  win: 5, score: "8-5"
//  3. PLAYOFFS (Dec 29): fill in win: (team number) and score the
//     same way, at the bottom of this file.
// ============================================================
window.LEAGUE_DATA = {
  teams: [
    {name: "Team 1", pf: 0, pa: 0},
    {name: "Team 2", pf: 0, pa: 0},
    {name: "Team 3", pf: 0, pa: 0},
    {name: "Team 4", pf: 0, pa: 0},
    {name: "Team 5", pf: 0, pa: 0},
    {name: "Team 6", pf: 0, pa: 0},
    {name: "Team 7", pf: 0, pa: 0},
    {name: "Team 8", pf: 0, pa: 0},
    {name: "Team 9", pf: 0, pa: 0},
    {name: "Team 10", pf: 0, pa: 0},
    {name: "Team 11", pf: 0, pa: 0},
    {name: "Team 12", pf: 0, pa: 0},
  ],

  weeks: [
    {date: "2026-12-01", label: "Dec 1", matches: [
      {slot: "6:00 PM", table: 1, a: 8, b: 11, win: null, score: ""},
      {slot: "6:00 PM", table: 2, a: 2, b: 3, win: null, score: ""},
      {slot: "6:20 PM", table: 1, a: 2, b: 9, win: null, score: ""},
      {slot: "6:20 PM", table: 2, a: 3, b: 8, win: null, score: ""},
      {slot: "6:40 PM", table: 1, a: 9, b: 11, win: null, score: ""},
      {slot: "6:40 PM", table: 2, a: 1, b: 8, win: null, score: ""},
      {slot: "7:00 PM", table: 1, a: 3, b: 10, win: null, score: ""},
      {slot: "7:00 PM", table: 2, a: 6, b: 9, win: null, score: ""},
      {slot: "7:20 PM", table: 1, a: 1, b: 6, win: null, score: ""},
      {slot: "7:20 PM", table: 2, a: 7, b: 11, win: null, score: ""},
      {slot: "7:40 PM", table: 1, a: 7, b: 10, win: null, score: ""},
      {slot: "7:40 PM", table: 2, a: 4, b: 6, win: null, score: ""},
      {slot: "8:00 PM", table: 1, a: 4, b: 12, win: null, score: ""},
      {slot: "8:00 PM", table: 2, a: 5, b: 10, win: null, score: ""},
      {slot: "8:20 PM", table: 1, a: 4, b: 5, win: null, score: ""},
      {slot: "8:20 PM", table: 2, a: 7, b: 12, win: null, score: ""},
      {slot: "8:40 PM", table: 1, a: 5, b: 12, win: null, score: ""},
    ]},
{date: "2026-12-08", label: "Dec 8", matches: [
      {slot: "6:00 PM", table: 1, a: 3, b: 4, win: null, score: ""},
      {slot: "6:00 PM", table: 2, a: 1, b: 9, win: null, score: ""},
      {slot: "6:20 PM", table: 1, a: 1, b: 3, win: null, score: ""},
      {slot: "6:20 PM", table: 2, a: 9, b: 12, win: null, score: ""},
      {slot: "6:40 PM", table: 1, a: 1, b: 7, win: null, score: ""},
      {slot: "6:40 PM", table: 2, a: 2, b: 4, win: null, score: ""},
      {slot: "7:00 PM", table: 1, a: 2, b: 12, win: null, score: ""},
      {slot: "7:00 PM", table: 2, a: 7, b: 8, win: null, score: ""},
      {slot: "7:20 PM", table: 1, a: 8, b: 12, win: null, score: ""},
      {slot: "7:20 PM", table: 2, a: 2, b: 5, win: null, score: ""},
      {slot: "7:40 PM", table: 1, a: 6, b: 11, win: null, score: ""},
      {slot: "7:40 PM", table: 2, a: 8, b: 10, win: null, score: ""},
      {slot: "8:00 PM", table: 1, a: 5, b: 6, win: null, score: ""},
      {slot: "8:00 PM", table: 2, a: 10, b: 11, win: null, score: ""},
      {slot: "8:20 PM", table: 1, a: 6, b: 10, win: null, score: ""},
      {slot: "8:20 PM", table: 2, a: 5, b: 11, win: null, score: ""},
    ]},
    {date: "2026-12-15", label: "Dec 15", matches: [
      {slot: "6:00 PM", table: 1, a: 2, b: 8, win: null, score: ""},
      {slot: "6:00 PM", table: 2, a: 5, b: 9, win: null, score: ""},
      {slot: "6:20 PM", table: 1, a: 7, b: 9, win: null, score: ""},
      {slot: "6:20 PM", table: 2, a: 5, b: 8, win: null, score: ""},
      {slot: "6:40 PM", table: 1, a: 2, b: 7, win: null, score: ""},
      {slot: "6:40 PM", table: 2, a: 4, b: 9, win: null, score: ""},
      {slot: "7:00 PM", table: 1, a: 2, b: 10, win: null, score: ""},
      {slot: "7:00 PM", table: 2, a: 4, b: 7, win: null, score: ""},
      {slot: "7:20 PM", table: 1, a: 1, b: 4, win: null, score: ""},
      {slot: "7:20 PM", table: 2, a: 10, b: 12, win: null, score: ""},
      {slot: "7:40 PM", table: 1, a: 1, b: 10, win: null, score: ""},
      {slot: "7:40 PM", table: 2, a: 3, b: 12, win: null, score: ""},
      {slot: "8:00 PM", table: 1, a: 3, b: 6, win: null, score: ""},
      {slot: "8:00 PM", table: 2, a: 1, b: 11, win: null, score: ""},
      {slot: "8:20 PM", table: 1, a: 3, b: 11, win: null, score: ""},
      {slot: "8:20 PM", table: 2, a: 6, b: 12, win: null, score: ""},
    ]},
    {date: "2026-12-22", label: "Dec 22", matches: [
      {slot: "6:00 PM", table: 1, a: 11, b: 12, win: null, score: ""},
      {slot: "6:00 PM", table: 2, a: 1, b: 2, win: null, score: ""},
      {slot: "6:20 PM", table: 1, a: 1, b: 12, win: null, score: ""},
      {slot: "6:20 PM", table: 2, a: 2, b: 11, win: null, score: ""},
      {slot: "6:40 PM", table: 1, a: 1, b: 5, win: null, score: ""},
      {slot: "6:40 PM", table: 2, a: 2, b: 6, win: null, score: ""},
      {slot: "7:00 PM", table: 1, a: 4, b: 11, win: null, score: ""},
      {slot: "7:00 PM", table: 2, a: 6, b: 7, win: null, score: ""},
      {slot: "7:20 PM", table: 1, a: 5, b: 7, win: null, score: ""},
      {slot: "7:20 PM", table: 2, a: 6, b: 8, win: null, score: ""},
      {slot: "7:40 PM", table: 1, a: 4, b: 8, win: null, score: ""},
      {slot: "7:40 PM", table: 2, a: 3, b: 5, win: null, score: ""},
      {slot: "8:00 PM", table: 1, a: 8, b: 9, win: null, score: ""},
      {slot: "8:00 PM", table: 2, a: 3, b: 7, win: null, score: ""},
      {slot: "8:20 PM", table: 1, a: 3, b: 9, win: null, score: ""},
      {slot: "8:20 PM", table: 2, a: 4, b: 10, win: null, score: ""},
      {slot: "8:40 PM", table: 1, a: 9, b: 10, win: null, score: ""},
    ]},
  ],

  playoffs: {
    qf:    [ {win: null, score: ""}, {win: null, score: ""}, {win: null, score: ""}, {win: null, score: ""} ],
    sf:    [ {win: null, score: ""}, {win: null, score: ""} ],
    third: {win: null, score: ""},
    final: {win: null, score: ""}
  },

  championship: { date: "2026-12-29", label: "Dec 29" }
};

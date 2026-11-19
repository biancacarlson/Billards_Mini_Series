# Billiards Mini Series

One link. Teams sign up. You get an email for each team.

## Setup (from your iPhone)

1. **Get your form key (free).** web3forms.com > enter your email > Create Access Key.
2. **Edit `config.js`.** Paste the key, add your Venmo username, commit. To offer Zelle as a small backup option, add your Zelle phone or email to `zelleContact` (leave it blank to hide it).
3. **Turn on the website.** Repo > Settings > Pages > Source: **GitHub Actions**.
4. **Get your link.** Repo > Actions. When the run is green, your link is `https://YOUR-GITHUB-NAME.github.io/REPO-NAME/`.

## Weekly update (Schedule and Bracket tabs)

Everything lives in **`league-data.js`**. Open it in GitHub, tap the pencil, edit, commit.

- **Team names:** replace "Team 1" through "Team 12" with real names. Order = team number. Extra numbers = bye.
- **After each game:** change `win: null` to the winning team's number (score is optional), like `win: 5`.
- **Tiebreakers:** update each team's `pf` and `pa` (game points scored and allowed).
- **Playoffs (Dec 29):** fill in `win` and `score` in the `playoffs` section. For a best-of-3 match, `win` is the team that wins the match and `score` is the games, like `"2-1"`.

Standings, seeds and the bracket fill in on their own.

## Schedule setup

Two tables, 6:00 to 9:00 PM each Tuesday, 20-minute games. It is a full round robin: with 12 teams that is 66 games, and every team plays each of the other 11 teams exactly once. Weeks 1 and 4 have 17 games (the last game starts at 8:40, on one table). Weeks 2 and 3 have 16 games (done by 8:40). Each team plays 3 games a night except one night when it plays 2. Games are bunched so each team is there about 1 hour. Championship Night (Dec 29) uses the same two tables: 4 single-game quarterfinals (6:00 and 6:20), then best-of-3 semifinals starting at 6:40 (done by 7:40 at the latest), then the best-of-3 final at 7:40 with the single-game 3rd-place match on the other table (done by 8:40 at the latest), so it always ends before 9:00 PM.

Free Web3Forms plan: 250 sign-ups a month.

## Version tag

The small version tag (like `v2`) at the bottom of the page shows which version is live. If it doesn't match the latest version, the site hasn't updated yet: check Repo > Actions for a green run, then refresh.

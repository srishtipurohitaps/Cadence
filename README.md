# Cadence

*a record of what you finish*

Built for [Tabbed](https://tabbed.hackclub.com/), a [Hack Club](https://hackclub.com/) YSWS.

I kept a running list of every book, show and game I finished in my Notes app for the longest time, and it was always just... a list. It never really told me how consistently I was finishing things or what that looked like over time.

So I made Cadence, a small tracker for the things you actually finish. It keeps track of what you've completed, how often you come back to it, and the rhythm that starts to form along the way.

## What it does

* Add something you've finished and choose between a Movie, Show, Book, Game or Album
* Add a genre and give it a rating out of five stars
* Keep everything in one simple log, with your newest entries first
* See the days you've finished something on a 30-day activity calendar
* Keep track of your current and longest streak
* See how much you've finished each month through a small analytics chart
* Switch between light and dark mode with `T`

## Built for keyboard only

This is probably my favourite part of Cadence.

The entire app is meant to be used with just your keyboard. There's no mouse support, the Tab key is disabled, and everything works through arrow keys and a few simple shortcuts.

`N` lets you add something new, `/` opens search, the arrow keys move you around, `1` through `5` set your rating, `Enter` confirms things, and `T` switches the theme.

Even scrolling is keyboard-only through `Page Up`, `Page Down`, `Home` and `End`.

The calendar lights up whenever you finish something, and your streaks update as soon as you add a new entry.

There's also a small month-by-month chart in the analytics panel. The idea was to make your habit something you can actually see instead of another thing you have to remember.

## Themes

Press `T` whenever you want to switch between the two themes. Cadence starts with a dark theme, with a light mode if that's more your thing.

Your choice is saved, so it stays the same the next time you open the app.

## Tech Stack

* Express + TypeScript
* better-sqlite3
* Chart.js
* Deployed on Vercel

## AI usage

AI was used for debugging, especially while I was learning TypeScript, and for some of the annoying deployment issues I ran into along the way. It was also helpful when I got stuck on a few bugs that I couldn't immediately figure out.
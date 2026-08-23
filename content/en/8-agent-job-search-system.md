---
name: 8-Agent Job Search System
title: "Inside an 8-Agent System Running My Job Search"
slug: 8-agent-job-search-system
description: "A multi-agent system running on my own VPS that operates my job search — daily scanning, email triage, LinkedIn monitoring, research, and weekly strategic review."
---

## TL;DR

It's a multi-agent system running on my own VPS that operates my job search — daily scanning, email triage, LinkedIn monitoring, research, and weekly strategic review. Eight specialized agents split into two tiers: five "volume" agents doing daily/weekly operational work, and three "heavy" agents doing weekly review and reactive judgment calls. A ninth component, Concierge, is the single entry point for everything coming in over Telegram — it routes messages to the right specialist, turns multi-step requests into tickets on a shared board instead of blocking a conversation, and delivers one daily digest instead of eight separate chat threads. Below: what each agent does, how work actually moves between them, and the production issue that forced a redesign of how they talk to Telegram.

## The two tiers

*Volume agents* — JobHunter, Growth, Email, LinkedIn, Research — run on a cadence: daily or weekly, regardless of whether anything interesting happened that day. They run on a lighter model tier, since the work is high-frequency and mostly mechanical — scan, triage, summarize, flag.

*Heavy agents* — Executive, Coach, Finance — mostly don't have their own schedule. They respond when something is delegated to them, or run a single weekly pass. The split isn't about importance, it's about cadence and reasoning load: volume agents notice things, heavy agents decide things.

Concierge sits outside both tiers, as the interface layer.

## The agents

**JobHunter.** Runs a daily scan of new opportunities and a weekly review of the full pipeline. When a role is worth pursuing, JobHunter builds the "apply package" — in practice a Linear issue, with role details in the description and a set of comments carrying the screening checklist, application answers, CV notes, and outreach drafts. Everything about a given application lives in one place instead of being scattered across chat history. Every package carries a source field — cold, warm-referral, recruiter, or inbound — and before a cold package gets built, JobHunter checks it against two documents Research maintains: one tracking former colleagues at the target company, one tracking recruiters covering the region, so a "cold" application doesn't get built cold if a warmer path actually exists. JobHunter also incorporates comp benchmark data that Finance produces separately, so a package reflects both fit and market context by the time it's ready.

**Growth.** Watches skill and market trends on a weekly cadence. When it finds a gap between what postings are asking for and what my current positioning covers, it opens a task for Coach rather than just logging the observation somewhere.

**Email.** Daily inbox triage, built on a CLI-based mail client rather than a web integration, so it can run unattended on the VPS without needing a live browser session. Sorts and surfaces recruiter emails, rejections, and scheduling requests.

**LinkedIn.** Weekly content planning and daily engagement scanning, reading the live profile through browser automation rather than an API. It cannot post or engage on my behalf — it prepares and flags, I publish. That boundary is deliberate; I didn't want an agent with unsupervised write access to anything public-facing.

**Research.** The utility agent. Has its own daily news-monitoring schedule, but a large share of its work is delegated — other agents kick off a company deep-dive when they need context they don't have, and Research goes and gets it. It also owns two standing reference documents other agents draw on: a network map of former colleagues at companies I'm targeting, and a list of recruiters covering leadership roles in the region, built up opportunistically rather than in one pass.

**Executive.** A weekly review across the whole operation — pipeline health, where time is going, what's stalling — rather than execution of any specific task. It's scheduled deliberately last in the Monday sequence, after Growth, LinkedIn, Coach, and Finance have all run, so its synthesis is actually reading the week's real output rather than running in parallel with it and missing half the picture.

**Coach.** Interview and positioning prep, mostly reactive. Runs a weekly readiness check that says nothing when nothing is actually at interview stage that week — deliberately silent rather than sending filler.

**Finance.** Comp and offer analysis. Runs a weekly market-benchmark pass that writes current comp bands to disk, which JobHunter later pulls into the relevant apply packages. Otherwise reactive — it engages when there's an actual negotiation or offer to reason about.

**Concierge.** Not a specialist — the front door. Every inbound Telegram message goes through it first. A message prefixed with an agent name gets routed straight to that specialist, with the reply relayed back labeled by which agent answered. No prefix, and Concierge either answers directly or tells me which specialist to address. Anything that needs more than a quick synchronous reply becomes a task on the shared board instead of holding up a chat. Concierge also runs the daily digest — sweeping the results of every scheduled job across all eight agents into one summary instead of eight separate pings.

## How work actually moves

Scheduling doesn't live inside the agents themselves — recurring jobs are dispatched centrally, and a separate polling process picks up ready work and spawns the specialist needed to handle it. That decoupling matters: an agent doesn't need to be actively running for work to get scheduled, only for it to eventually get picked up.

Delegation between agents is fire-and-forget by design. When one agent hands work to another, it doesn't wait for the answer — waiting creates a dependency chain, and a dependency chain between two agents that both spin up on their own schedules is a straightforward way to deadlock. Instead, whatever a delegated agent produces gets folded in on the requester's next relevant run, not immediately.

The design principle for what counts as a "dealbreaker" also needed to be made explicit rather than left implicit. If something about a role changes after a package has already been built — say, the location requirements shift — that has to be surfaced, but it isn't grounds for the agent to discard the application on its own; that judgment stays with me. Similarly, a prepared application answer is never automatically invalidated by a changed job posting — it gets re-checked against the exact wording of the original screening question, because the question's scope is what determines whether the answer still holds, not whatever else changed about the listing.

One rule sits above all of that and applies to every agent equally: none of them ever submits an application, sends outreach or email, or publishes anything on LinkedIn on my behalf. Approval from me authorizes preparation only — drafting, packaging, queuing — never submission. I'm the one who actually sends.

## Where it actually broke

The one real production issue came from a design decision I made too casually early on: multiple agents sharing a single Telegram bot token, each trying to listen for inbound messages on it. That produced a crash loop — agents competing for the same inbound connection, none of them stable.

The fix was to stop treating Telegram access as something every agent gets by default. Concierge became the sole inbound front door, with its own dedicated bot. Every other specialist had its inbound Telegram listener explicitly turned off — they can still send outbound messages when Concierge routes a reply through them, but none of them compete for inbound traffic anymore.

The underlying issue wasn't any single agent behaving incorrectly. It was two components that were never supposed to share a resource, sharing one — and it only showed up once there were enough agents running concurrently for the contention to actually happen. It didn't surface in early testing with one or two agents active; it only appeared once the full eight-agent system was live.

A second issue took longer to actually fix than to notice. Early on, some agents had duplicate scheduled copies running alongside their main jobs — a leftover from testing. The obvious fix was to pause the duplicate copies, which I did, and the symptom went away. But the underlying ordering problem — Executive needing to run strictly after Growth, LinkedIn, Coach, and Finance on Mondays, not just after their duplicates were gone — wasn't actually addressed by that fix. It just stopped being visible, because the paused copies weren't the only path to it firing out of order. The real fix, sequencing Executive last in the Monday run explicitly rather than relying on the duplicates being gone, only landed later. It's a good example of a fix that resolves the symptom you're looking at without resolving the mechanism that could still produce it a different way.

The digest layer had a related class of problem: false positives in its own deduplication. The digest tracks scheduled jobs using a fingerprint, and that fingerprint originally included how "old" an item's rendered content was at the time. Two runs of the same underlying job could render slightly different ages for the same item, which meant the fingerprint changed even though nothing about the job itself had — and the digest would either miss the item or resurface it as if it were new. The fix was to fingerprint on item identity instead of rendered age, so the same underlying item hashes the same way regardless of when it happens to get rendered. It's a small distinction, but it's the difference between a dedup mechanism that's actually keyed on identity and one that's keyed on a value that happens to usually correlate with identity — which works right up until it doesn't.

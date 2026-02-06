# PM Review: SWARM Voice Platform PRD v2.0

**Reviewer:** Product Manager  
**Date:** 2026-02-06  
**PRD Version:** 2.0  
**Verdict:** 🟡 **Conditionally Ready** — 7 critical issues must be resolved before launch

---

## Executive Summary

This PRD is solid on vision and technical architecture but has significant gaps in **error handling**, **realistic onboarding expectations**, and **safety rails for AI failures**. The 15-minute deployment claim is aspirational without validation. Missing user stories for unhappy paths could lead to customer frustration and churn.

**Bottom line:** We're building the happy path well. The unhappy path could sink us.

---

## 1. User Stories Assessment

### ✅ What's Strong
- Clear personas with specific pain points and dollar values
- Good coverage of core booking/CRM/workflow features
- Acceptance criteria are measurable

### 🔴 Critical Gaps

| Missing Story | Why It Matters |
|---------------|----------------|
| **Caller asks for human** | What happens when AI can't help and no transfer number is configured? Caller stuck in loop? |
| **Calendar fully booked** | AI offers times, all rejected. Then what? Waitlist? Callback promise? |
| **Caller mid-abandonment** | Caller hangs up after giving name but before completing. Partial contact? Follow-up? |
| **Returning caller** | "Hi, I called yesterday about..." — does AI have context? Or cold start every time? |
| **Caller disputes AI** | "That's not what your website says!" — how does AI handle contradiction? |
| **Non-English caller** | PRD says English-only but no user story for graceful handling. "Press 2 for español"? |
| **Abusive caller** | What's the policy? AI hangs up? Escalates? Endless patience? |

### 🟡 Nice-to-Have Gaps

| Missing Story | Priority |
|---------------|----------|
| Call transfer mid-conversation | Medium |
| Voicemail fallback if AI fails | Medium |
| Caller callback scheduling | Low |
| Multi-party calls | Low (v2) |

**Recommendation:** Add user stories O5-O7 for error recovery and C5-C8 for call edge cases.

---

## 2. Onboarding UX: The 15-Minute Claim

### Reality Check ⏱️

Let's walk through what "Sarah" (dental owner) actually does:

| Step | PRD Estimate | Realistic Time | Blocker Risk |
|------|--------------|----------------|--------------|
| Sign up (Google OAuth) | 30 sec | 30 sec | ✅ Low |
| Select template | 30 sec | 2 min (reads all options) | ✅ Low |
| Customize greeting | 1 min | 5 min (writes, rewrites, previews) | 🟡 Medium |
| Add knowledge base | ? | 10-20 min (gathers FAQs, formats) | 🔴 High |
| Connect calendar | 1 min | 3-5 min (OAuth flow, scope approval) | 🟡 Medium |
| Voice selection | 1 min | 3 min (listens to samples) | ✅ Low |
| Phone number | "auto-provisioned" | 1-3 min (if instant), 24h (if verification needed) | 🔴 High |
| **Test call** | ??? | NOT IN PRD | 🔴 Critical gap |

**Realistic total:** 25-40 minutes for prepared user, 1-2 hours for typical user

### 🔴 Critical Issues

1. **No test call before going live** — User has no way to verify their agent works without calling their own number. This is unacceptable UX.

2. **Knowledge base is undefined** — "FAQ paste or file upload" but:
   - What file formats? PDF? DOCX? CSV?
   - What's the size limit?
   - How long does processing take?
   - Can they edit after upload?

3. **Phone number provisioning is a gamble** — PRD mentions "pre-provision pool" as mitigation but:
   - Is this implemented? Status: 🔲
   - What happens if pool is empty?
   - Local vs toll-free selection?

4. **No preview mode** — User can't see what callers will experience before publishing

### Recommendations

1. **Add "Test Your Agent" button** — Call simulation that lets user experience their own agent (P0)
2. **Starter knowledge base per template** — Pre-populate with industry FAQs so user can deploy immediately, customize later (P0)
3. **Change claim to "Deploy in 15 minutes with our starter template"** — More honest, still compelling
4. **Add progress indicator** — Show "Step 2 of 4" with time estimates

---

## 3. Edge Cases & Error States

### 🔴 The PRD Has Almost No Error Handling

This is the biggest gap. Real production systems fail constantly. Here's what's missing:

#### Infrastructure Failures

| Scenario | Current Handling | Required Handling |
|----------|------------------|-------------------|
| Vapi down | ❌ None | Failover to Retell (mentioned but no implementation story) |
| Vapi latency >5s | ❌ None | "One moment please" filler + timeout fallback |
| Twilio SMS fails | ❌ None | Retry queue + admin notification |
| Calendar OAuth expires | ❌ None | User notification + "booking unavailable" mode |
| Supabase down | ❌ None | Queue webhooks for replay, graceful degradation |
| User out of minutes | ❌ None | Mid-call handling? Pre-call block? Grace period? |

#### AI Failures

| Scenario | Current Handling | Required Handling |
|----------|------------------|-------------------|
| Hallucination detected | ❌ None | "Let me double-check that" + escalation |
| Intent confidence low | ❌ None | Clarifying question vs guess |
| Emergency false negative | ❌ None | Keyword + tone analysis + human review flag |
| Empty knowledge base | ❌ None | Block publishing or use template defaults |
| Caller asks off-topic question | ❌ None | Graceful redirect to scope |

#### Business Logic Failures

| Scenario | Current Handling | Required Handling |
|----------|------------------|-------------------|
| Workflow action fails | "3 retries + exponential backoff" | ✅ But no user visibility/notification |
| Duplicate contact created | ❌ None | Phone number deduplication + merge UI |
| Recording storage fails | ❌ None | Fallback storage + notification |
| Billing payment fails | ❌ None | Grace period? Service degradation? Hard stop? |

### Recommendations

1. **Add Error States section to PRD** (P0)
2. **Define graceful degradation strategy** for each external dependency (P0)
3. **Add user notification system** for failures that affect their service (P1)
4. **Create runbook** for ops team on each failure mode (P1)

---

## 4. Feature Prioritization Review

### What's Truly MVP?

| PRD Feature | My Assessment | Rationale |
|-------------|---------------|-----------|
| 8 industry templates | 🔴 Over-scoped | Launch with 3: dental, plumbing, generic. Add others post-PMF. |
| CSV export (R3) | 🟡 Nice-to-have | No one needs this day 1 |
| Sentiment labels (A3) | 🟡 Nice-to-have | Intent is enough for MVP |
| Workflow builder UI (done) | 🤔 Premature | UI is built but execution engine isn't. Should've been reverse. |
| All 3 calendar integrations | 🟡 Over-scoped | Google Calendar + Calendly covers 90%. Cal.com can wait. |
| Peak hours visualization (A1) | 🟡 Nice-to-have | Simple daily counts sufficient |

### What's Under-scoped for MVP?

| Feature | Status in PRD | Why It's Actually MVP |
|---------|---------------|----------------------|
| Test call functionality | ❌ Missing | Can't launch without user ability to test |
| Error notifications to user | ❌ Missing | User needs to know when their agent is failing |
| Minutes usage dashboard | ❌ Missing | Users will demand to see their usage vs plan |
| Manual call logging | ❌ Missing | When AI misses context, user needs to add notes |
| Agent pause/disable | ❌ Missing | User needs kill switch for their agent |

### Revised MVP Scope

**Remove from MVP:**
- 5 of 8 templates (keep dental, plumbing, generic)
- Cal.com integration
- CSV export
- Sentiment analysis
- Peak hours visualization

**Add to MVP:**
- Test call simulation
- Agent enable/disable toggle
- Minutes usage meter
- Basic error notifications

---

## 5. Usability Friction Points

### Agent Creation Flow

| Friction | Impact | Fix |
|----------|--------|-----|
| Voice selection with audio samples | Medium (decision paralysis) | Default to "recommended" voice per template, collapse others |
| Persona prompt editor | High (technical) | Replace with personality sliders: "Friendly ←→ Professional" |
| Transfer number optional | High (AI dead end) | Make required OR provide clear "AI will offer callback" fallback |
| No preview | Critical | Add "Preview as Caller" modal before publish |

### Dashboard UX

| Friction | Impact | Fix |
|----------|--------|-----|
| Call transcript search | Medium | Needs clear empty state and example queries |
| Contact status pipeline | Low | Pre-populate with helpful defaults |
| Workflow builder | High (complexity) | Start with pre-built workflows, hide builder in "Advanced" |

### Mobile Experience

PRD says "mobile responsive" but:
- No mobile-specific user stories
- Dashboard with tables/graphs won't work well
- What does "review call transcript" look like on phone?

**Recommendation:** Define mobile-first views for:
- Recent calls list
- Call detail with playback
- Contact quick-add
- Usage/billing check

---

## 6. Metrics Review

### ✅ Good Metrics
- Time to first live call (<15 min)
- Lead capture rate (>80%)
- Monthly churn (<8%)
- NPS (>40)

### 🔴 Missing Critical Metrics

| Missing Metric | Why It Matters |
|----------------|----------------|
| **First call success rate** | Did user's first real call work? This predicts retention. |
| **Time to first value** | Not just deploy, but first lead captured |
| **Cost per lead** | Users need ROI proof for upsell/retention |
| **Latency p95/p99** | User experience quality |
| **Error rate by type** | Operational health |
| **Knowledge base coverage** | % of calls answered from KB vs "I don't know" |
| **Workflow completion rate** | Are automations actually working? |

### 🟡 Metrics Needing Definition

| Metric | Issue |
|--------|-------|
| "Emergency detection 100%" | How measured? What's the audit process? Sample size? |
| "Hallucination rate <5%" | How detected? Automated or manual? |
| "Answer accuracy >90%" | Who judges? What's the rubric? |
| NPS "in-app survey" | When triggered? After call? After week? |

### Recommendations

1. **Add operational dashboard** with latency, error rates, uptime (P1)
2. **Define measurement methodology** for AI quality metrics (P0)
3. **Add "Time to First Lead"** as north star activation metric (P0)
4. **Implement ROI calculator** showing customer value captured (P2)

---

## 7. Prioritized Must-Fix Issues

### 🔴 P0 — Block Launch

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 1 | **No test call functionality** — Users cannot verify agent works before going live | Engineering | M |
| 2 | **No error handling stories** — Platform will fail ungracefully | PM + Eng | L |
| 3 | **15-minute claim unvalidated** — Will cause immediate trust loss if not true | PM | S |
| 4 | **Missing user stories for unhappy paths** — No spec for when things go wrong | PM | M |
| 5 | **Emergency detection has no failsafe** — False negative = liability nightmare | PM + Eng | M |
| 6 | **No agent disable/pause** — User has no kill switch | Engineering | S |
| 7 | **Minutes usage not visible** — Users will hit limits without warning | Engineering | S |

### 🟡 P1 — Fix Before Week 4

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 8 | Knowledge base UX undefined (formats, limits, editing) | PM + Design | M |
| 9 | Graceful degradation strategy for Vapi/Twilio failures | Engineering | L |
| 10 | Mobile experience undefined | Design | M |
| 11 | Duplicate contact handling | Engineering | S |
| 12 | Workflow failure visibility | Engineering | S |
| 13 | Reduce template scope (8→3) | PM | S |

### 🟢 P2 — Nice to Have for Launch

| # | Issue | Owner | Effort |
|---|-------|-------|--------|
| 14 | ROI calculator/value dashboard | Design + Eng | M |
| 15 | Personality sliders vs prompt editor | Design | M |
| 16 | Pre-built workflow templates | PM | S |
| 17 | Returning caller context | Engineering | L |

---

## 8. Final Recommendations

### Do Before MVP (Week 2)
1. Add test call button (even if it's just "call this number yourself")
2. Add agent enable/disable toggle
3. Add minutes used counter
4. Write error handling spec for top 5 failure modes

### Do Before Alpha (Week 4)
1. Validate 15-minute claim with 5 real users
2. Document knowledge base requirements
3. Implement graceful degradation for Vapi
4. Reduce template scope to 3

### Do Before Launch (Week 8)
1. Full error notification system
2. Mobile-responsive critical flows
3. NPS survey implementation with defined trigger
4. Emergency detection audit process documented

---

## Summary

This PRD gets the **vision right** and the **happy path right**. What's missing is everything that happens when things go wrong — which in production is constantly.

The 15-minute claim is marketing, not product reality. We should either:
- A) Build to make it true (test call, pre-populated KB, instant numbers)
- B) Change the claim to something we can deliver

I'm excited about this product. With these fixes, we have a real shot at PMF.

---

*Review complete. Ready to discuss any item in detail.*

**— PM Review, 2026-02-06**

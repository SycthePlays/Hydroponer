# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Report privately through GitHub's private vulnerability reporting on this repository, or contact the maintainers directly.

Please include:

- What the issue is, and what an attacker could do with it
- Steps to reproduce
- Affected component — web, worker, depth service, or documentation of an unsafe practice
- Whether user photos or plan data are reachable

## What to expect

| Stage | Target |
|---|---|
| Acknowledgement | Within 3 days |
| Initial assessment | Within 7 days |
| Fix or mitigation for a critical issue | Within 30 days |
| Public disclosure | Coordinated with you, after a fix ships |

We will credit you in the advisory unless you prefer otherwise.

## What we care about most

The threat model is documented in [Security and Privacy](docs/15-security-privacy.md). The issues we consider most severe, in order:

1. **Anything that exposes another user's photos.** Users photograph the inside of their homes. This is the worst outcome the product has.
2. Unauthorised access to plans, spaces, or account data
3. Authentication or session flaws
4. Prompt injection that changes what the pipeline does, rather than merely what it reports
5. Cost-exhaustion attacks against the model-calling path
6. Injection, SSRF, or XSS anywhere in the stack

## Out of scope

- Findings from automated scanners with no demonstrated impact
- Missing headers with no exploitable consequence
- Rate-limit thresholds you consider too generous, absent a demonstrated abuse path
- Social engineering of maintainers
- Denial of service by traffic volume

## Safe harbour

Good-faith research that follows this policy will not be pursued legally. Please do not access, modify, or retain data belonging to anyone but yourself, and stop as soon as you have confirmed a vulnerability exists.

## Safety reports are security reports

If a generated plan would be physically unsafe — a structural load not flagged, an electrical arrangement that puts a device under a water line, a chemical instruction that could hurt someone — report it through this channel with the same urgency. In this product, a physical hazard is a higher severity than most software bugs.

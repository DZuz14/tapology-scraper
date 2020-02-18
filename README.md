# New England Regional Scraper

Scrapes every MMA event to happen in the New England Region that is listed in Tapology's FightCenter.

## Installation

- `git clone https://github.com/DZuz14/tapology-scraper.git`
- `npm i`

## Running

- `git checkout new-england`
- `npm run test`

## Procedure

- For each page of events:
  - For each event:
    - Get event details.
    - If promotion visited:
      - Continue.
    - Else:
      - Visit promotion page.
    - For each fight:
      - If fighter profile visited:
        - Continue.
      - Else:
        - Visit profile page.
        - If affiliation visited:
          - Continue.
        - Else:
          - Visit affiliation page.
      - Get fight results.

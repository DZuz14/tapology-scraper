# New England Regional Scraper

Scrapes every MMA event to happen in the New England Region that is listed in Tapology's FightCenter.

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

## Notes

The bulk of the code that needs to be written is in regards to the procedural traversal listed abov, and formatting the data into the schema model listed in the CSV. I will look to reuse as much of the existing code as possible, and am thinking I won't even bother with changing the data structure that I store fight data in, and instead write some type of converter function that puts it into the format we need. I haven't given that too much thought yet, so that is up in the air at the moment.

I am glad to explain how everything works, and you can feel free to use it on your own whenever you want.

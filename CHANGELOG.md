# Change Log

This file is a record of all changes, including unreleased ones, made to version releases of Just Not Sorry.

## [1.5.1] - 2017-02-12
### Fixed
- With 1.5.0, if the user was also using certain other extensions, Just Not Sorry underline triggers would cause the browser's tab to immediately crash. This has been resolved by making the mutation observer less sensitive (removing the `attributes` option).

## [1.5.0] - 2017-02-06
### Added
- Just Not Sorry now works with Google Inbox and Gmail.

### Removed
- Dependency on [`Gmail.js`] and [`jQuery`] was removed in the main app. [`jQuery`] remains in the testing suite.

### Changed
- Just Not Sorry now relies upon a mutation observer to identify changes, now that [`Gmail.js`] has been removed. All [`jQuery`] has been converted to vanilla JavaScript.

- Testing has been updated and all tests are passing.

- A new argument, `fieldType`, has been added. This argument is passed through many functions and allows us to differentiate between when a user is writing in a compose box, a reply box, and a forward box.

- The existing bug, where the underline will not follow a keyword after a carriage return has been fixed on Gmail (although there is noticable delay) and persists on Inbox (or will sometimes follow with much more delay).

### Fixed
- When a user completes typing of a keyword, underline will immediately come into place, instead of waiting until the keystroke following the completion of the keyword.

- Underline aligment has been tweaked.

## [1.0.0] - 2016-04-03
### Overview
First release, with Jasmine testing. Just Not Sorry uses the [`Gmail.js`] library and [`jQuery`] to identify keywords (in the [`Warnings.js`] file) in email compositions in Gmail through [`dom-regexp-match`]. Whenever a match is found, the offending word or phrase is underlined with a dotted red line. Additionally, there is a mouseover effect where a message will be displayed explaining why the keyword received the warning.

When a keyword has begun to be deleted, the underline disappears. Underlines will also disappear if the composition area is blurred, and reappear when focus is returned to the composition area.

### Known bugs
- The user must type one extra character after completing a keyword in order for the underline to appear. Therefore, once the user has completed the word "just", the underling will NOT yet appear. However, upon the following keystroke, the underline will appear.

- Underline is sometimes not perfectly horizontally aligned. Vertical alignment seems alright.

- When the user puts the cursor at the beginning of the keyword and presses enter/return to create a new paragraph starting with that word, while the keyword is already at the beginning of a paragraph (or there is only whitespace before the start of the keyword on that line), the underline will remain on the wrong line and not follow the keyword.

- Similar to the above, if the user presses the down arrow key in the composition area, the cursor will descend beyond the last paragraph, at unusual line height intervals.

- If ths user loads a reply message that has already been started, additional misplaced highlights appear.

[1.5.1]: https://github.com/defmethodinc/just-not-sorry
[1.5.0]: https://github.com/defmethodinc/just-not-sorry/releases/tag/v1.5.0
[1.0.0]: https://github.com/defmethodinc/just-not-sorry/releases/tag/v1.0.0
[`Gmail.js`]: https://github.com/KartikTalwar/gmail.js/tree/master
[`jQuery`]: https://jquery.com/
[`warnings.js`]: https://github.com/cyrusinnovation/just-not-sorry/blob/master/src/Warnings.js
[`dom-regexp-match`]: https://github.com/webmodules/dom-regexp-match

# ⊹ CHARACTER GRID ⊹

An image-first character launcher for SillyTavern. When no chat is open, it
replaces the welcome area with a portrait grid ordered by each character's most
recent chat — and now lets you browse, open, rename, and delete every chat a
character has, without leaving the grid.

Based on [Ace Character Grid](https://github.com/aceeenvw/ace-character-grid) by
**aceenvw**. The look is intentionally the same; the additions stay out of the
way until you reach for them.

## What's new

- **Chat history for every character.** Open a character's chats to see each
  one with its last message, message count, and when you last talked. Open any
  chat, continue the current one, or start a new one.
- **Rename and delete chats** right from the list.
- **Search and sort** the grid (Recent, A–Z, Favourites). Press <kbd>/</kbd> to
  jump to search, <kbd>Esc</kbd> to clear it.
- **Optional last-chat time** under each name.
- **Adapts to your device.** On desktop and tablets the chats open in a side
  drawer; on phones they open in a bottom sheet you can swipe down to dismiss.
- No flash of the wrong chat: the grid stays up until the chat you picked is
  ready.

## Installation

In SillyTavern, open **Extensions → Install Extension** and enter:

```
https://github.com/howardsierra/Character-Grid
```

If you also have Ace Character Grid installed, disable it so only one grid
takes over the home screen.

## Usage

Return to SillyTavern's home screen with no chat open. The grid appears
automatically.

| | Desktop | Tablet & phone |
| --- | --- | --- |
| Open the current chat | Click a portrait | Tap a portrait |
| See all chats | Hover → <i>clock</i> icon, or right-click | Press and hold a portrait |
| Delete a character | Hover → trash icon | Press and hold → trash icon |
| Close the chats panel | <kbd>Esc</kbd>, ✕, or click outside | Swipe down, ✕, or tap outside |

Inside the chats panel:

- **Continue** opens the character's current chat (marked *Current*).
- **New chat** starts a fresh chat with the character's greeting.
- Select any chat to open it. Use the pencil to rename it and the trash can to
  delete it. Characters with many chats also get a search box.

Deleting a character uses SillyTavern's confirmation dialog, where you can also
choose whether to delete the character's chat files.

## Settings

Open **Extensions → ⊹ CHARACTER GRID ⊹** to choose:

- **Card theme** — Dark, Light, or Custom portrait nameplates.
- **Columns** — Auto or 3–10 columns. The default is 6. Phones use two.
- **Cards per page** — 24, 48, or 96. The default is 48.
- **Search and sort bar** — On by default.
- **Last chat time** — Off by default.

The grid displays characters only. Group chats are not included.

## Credits

Original extension: **Ace Character Grid** by **aceenvw**, itself inspired by
[Another Character Library](https://github.com/ayvencore/Sillytavern-Another-Character-Library)
by **Ayvencore**.

## License

GPL-3.0-or-later. See [`LICENSE`](./LICENSE).

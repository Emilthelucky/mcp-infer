# Contributing to mcp-infer

Thanks for your interest. This guide covers setup and the expectations for pull requests. The detailed rules for code and commits live in [AGENTS.md](AGENTS.md); they apply to human contributors and coding agents alike.

## Setup

Requirements: Node 20 or later and pnpm (the version is pinned in `package.json`; `corepack enable` picks it up).

```bash
git clone https://github.com/Emilthelucky/mcp-infer.git
cd mcp-infer
pnpm install   # also installs the commit-msg hook
pnpm build
pnpm test
```

## Before opening a pull request

1. For anything larger than a small fix, open an issue first so the approach can be agreed on.
2. Keep the PR focused on one change.
3. Add a test that fails without your change.
4. Run `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm format:check`.
5. Add a changeset with `pnpm changeset` if a published package changes behavior.

CI runs on Linux, macOS, and Windows. Avoid assumptions about path separators and line endings.

## Reporting bugs and requesting features

Use the [issue templates](https://github.com/Emilthelucky/mcp-infer/issues/new/choose). For security issues, follow [SECURITY.md](SECURITY.md) instead.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

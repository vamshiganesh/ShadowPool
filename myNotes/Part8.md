You installed the **global npm package** `circom` (v0.5.46). npm reported it as deprecated — that is the **old Circom 1.x** compiler, not Circom 2.x. ShadowPool’s docs reference `pragma circom 2.0.0`, so you likely want the **Rust-based Circom 2 compiler**, not this npm package.

---

## 1. Uninstall the global npm `circom`

```bash
npm uninstall -g circom
```

Confirm it’s gone:

```bash
which circom
circom --version
```

If `which circom` still points somewhere, check npm’s global bin path:

```bash
npm prefix -g
# usually ~/.npm-global or /usr/local — look for `circom` in that bin folder
```

---

## 2. Install in the ShadowPool project (npm way)

If you still want the **same npm package** as a **local dev dependency**:

```bash
cd ~/projects/shadowpool/ShadowPool
npm install -D circom
```

Run it via:

```bash
npx circom --help
```

Optional `package.json` script:

```json
"compile:circuit": "circom circuits/shadowpool_match.circom --r1cs --wasm --sym"
```

That keeps the compiler tied to the project (`node_modules/.bin/circom`) instead of your home global install.

---

## 3. What you probably actually want: Circom 2

ShadowPool does **not** list `circom` in `package.json` yet, and the UI/docs assume **Circom 2** (`shadowpool_match.circom`). For that, use the official Rust compiler:

```bash
# One-time: install Rust if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Circom 2 compiler
cargo install circom
```

**Project-local** (no global cargo install):

```bash
cd ~/projects/shadowpool/ShadowPool
cargo install circom --root .
```

Then run:

```bash
./bin/circom --version
./bin/circom circuits/shadowpool_match.circom --r1cs --wasm --sym
```

Add `./bin` to scripts in `package.json` or use the full path so teammates get a reproducible setup.

---

## Quick comparison

| Method | Command | Good for ShadowPool? |
|--------|---------|----------------------|
| `npm install -g circom` | global npm | No — deprecated Circom 1.x |
| `npm install -D circom` | local npm | Same old compiler, project-scoped |
| `cargo install circom` | Rust binary | Yes — Circom 2.x |

---

## Recommended path for ShadowPool

1. `npm uninstall -g circom`
2. Skip `npm install circom` in the frontend app
3. Add a `circuits/` folder in the repo
4. Install **Circom 2** via `cargo install circom` (global or `--root .` in the project)
5. Use **snarkjs** / **circomlibjs** in the app for proving/verification in the browser later

If you want, switch to **Agent mode** and I can scaffold `circuits/`, compile scripts, and wire them into `package.json` for you.
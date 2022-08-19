# icon-slayer

Technically more of a assistant rather than slayer ;) Help move things around and save some labour.

## How does it work

### Step 1: SVGO

Convert new svg files to desired format using [svgo](https://github.com/svg/svgo). The svgo config is copied from canva repo, where we need to convert from yaml to js and adapt to th new schema.

The converted files will be stored under the output directorym, named as `*.inline.svg`.

### Step 2: Relocate to [Canva/canva](https://github.com/Canva/canva)

Relocate all converted inline svg files under the icons path of the canva repo, each under a separate folder and with a entry `icon.ts` file.

### Step 3: Add to stories

**TBD**
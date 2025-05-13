# LeetcodeAP

An Archipelago hint client for Leetcode.

## Installation

Download `leetcode-ap-win.zip` in the latest release [here](https://github.com/redside100/leetcode-ap/releases/tag/1.0.0).

Unpack the zip file, then run `LeetcodeAP.exe`.

For Linux and Mac support, consider building it from the source on the respective platform.

```bash
npm install
npm run build:linux
npm run build:mac
```


## Usage

Connect to the Archipelago server. You'll need:

  - The server host
  - The server port
  - The slot you want to hint for
  - The optional server password
  - Your **Leetcode** username for tracking

Once connected, start solving Leetcode questions! Do note that at the time of connecting, your last 20 submissions are already taken into account, so make sure to solve new questions.

Each new **accepted** submission will grant a hint to the slot you're connected to.

Each **rejected** submission will cause a death link trigger, if the "Death Link" option is checked.

## Gallery
![image](https://github.com/user-attachments/assets/fb17267d-f334-4eb7-8f33-6fc011afbd0b)

![image](https://github.com/user-attachments/assets/fe407515-408b-4ac7-9abd-eed0fac584c4)

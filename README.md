# Add Music to Video

I am always screen grabbing videos of app demos to send to colleagues. I wanted to make these tiny videos fun because it can be annoying to watch silent videos over and over again, especially when those videos are showing you flaws in your code.

Before this, I used to pop open Video Editor, and add some music to the video. But it's slow, and I have other things to do.

I wanted the easiest way to add random music to videos, hence this project.

## Usage

To use:

```sh
npx add-music-to-video
```

or

```sh
npx add-music-to-video run /path/to/video.mp4
```

## Installation on Windows machines

By installing this package, you can right-click on a Video file in Windows explorer, and use the context menu to add music to the selected video.

To install:

```sh
npm i -g add-music-to-video; add-music-to-video install
```

Now, you can add music to any video by:

- Right-click on the video file in Windows Explorer
- Click on "Add Music to Video"

## Uninstall

```sh
npx add-music-to-video uninstall
```

## Credits

- [Wolfram Tones](https://tones.wolfram.com/generate/GtcqZlxi25yPmgvxHRIEQTagP54Du87b276wY8Mg) is amazing. We couldn't have gotten random music without them.
- ffmpeg

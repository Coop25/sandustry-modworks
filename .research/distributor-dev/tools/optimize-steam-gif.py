from pathlib import Path
from PIL import Image


SOURCE = Path(r"C:\Users\frank\Downloads\Recording 2026-08-18 125305.gif")
OUTPUT_DIR = Path(__file__).resolve().parents[3] / "distributor"


def optimize(width: int, colors: int, output_name: str) -> Path:
    source = Image.open(SOURCE)
    height = round(source.height * width / source.width)
    frames = []
    durations = []

    # Keep every other source frame, combining its display time with the
    # skipped frame. This changes 25 FPS to 12.5 FPS without changing length.
    index = 0
    while index < source.n_frames:
        source.seek(index)
        frame = source.convert("RGB").resize(
            (width, height), Image.Resampling.LANCZOS
        )
        frame = frame.quantize(
            colors=colors,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        )
        duration = source.info.get("duration", 40)
        if index + 1 < source.n_frames:
            source.seek(index + 1)
            duration += source.info.get("duration", 40)
        frames.append(frame)
        durations.append(duration)
        index += 2

    output = OUTPUT_DIR / output_name
    frames[0].save(
        output,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=2,
    )
    return output


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for width, colors, name in (
        (520, 96, "distributor-demo-520.gif"),
        (480, 80, "distributor-demo-480.gif"),
        (440, 64, "distributor-demo-440.gif"),
        (420, 56, "distributor-demo-steam.gif"),
    ):
        result = optimize(width, colors, name)
        print(f"{result.name}: {result.stat().st_size} bytes")

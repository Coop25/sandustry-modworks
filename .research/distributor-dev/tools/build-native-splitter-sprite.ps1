param(
    [string]$BaseSprite = "$PSScriptRoot\..\assets\filter_wall_mk2.png",
    [string]$OutputPath = "$PSScriptRoot\..\assets\distributor.png"
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $BaseSprite))
try {
    if ($source.Width -ne 18 -or $source.Height -ne 18) {
        throw "The Advanced Filter Wall reference must be exactly 18x18 pixels."
    }

    $sprite = New-Object System.Drawing.Bitmap 18, 18, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($sprite)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.DrawImageUnscaled($source, 0, 0)
        } finally {
            $graphics.Dispose()
        }

        $black = [System.Drawing.Color]::FromArgb(255, 0, 0, 0)
        $blue = [System.Drawing.Color]::FromArgb(255, 53, 104, 208)
        $lightBlue = [System.Drawing.Color]::FromArgb(255, 120, 165, 255)

        # The game draws a red placement/selection layer behind structures.
        # Make the machine body opaque so that layer cannot show through the
        # decorative transparent cutouts inherited from Filter Wall Mk.2.
        for ($y = 0; $y -lt $sprite.Height; $y++) {
            for ($x = 0; $x -lt $sprite.Width; $x++) {
                if ($sprite.GetPixel($x, $y).A -eq 0) {
                    $sprite.SetPixel($x, $y, $black)
                }
            }
        }

        function Set-Pixels([System.Drawing.Color]$Color, [int[][]]$Points) {
            foreach ($point in $Points) {
                $sprite.SetPixel($point[0], $point[1], $Color)
            }
        }

        # Top intake: the Advanced Filter's blue crown narrows into a clear
        # downward-facing inlet and then feeds the central distribution hub.
        Set-Pixels $lightBlue @(
            @(8, 0), @(9, 0),
            @(8, 2), @(9, 2),
            @(7, 3), @(8, 3), @(9, 3), @(10, 3),
            @(8, 4), @(9, 4)
        )
        Set-Pixels $blue @(
            @(8, 5), @(9, 5),
            @(8, 6), @(9, 6),
            @(8, 7), @(9, 7)
        )

        # A one-pixel horizontal network bus reaches both tile edges. Adjacent
        # Splitters therefore form one uninterrupted line when drag-placed.
        Set-Pixels $blue @(
            @(0, 9), @(1, 9), @(2, 9), @(3, 9), @(4, 9), @(5, 9), @(6, 9),
            @(11, 9), @(12, 9), @(13, 9), @(14, 9), @(15, 9), @(16, 9), @(17, 9)
        )
        Set-Pixels $lightBlue @(
            @(1, 8), @(1, 9), @(1, 10),
            @(16, 8), @(16, 9), @(16, 10),
            @(7, 8), @(8, 8), @(9, 8), @(10, 8),
            @(7, 9), @(8, 9), @(9, 9), @(10, 9),
            @(7, 10), @(8, 10), @(9, 10), @(10, 10)
        )

        # Bottom route: a blue stem exits the hub and ends in a downward arrow.
        Set-Pixels $blue @(
            @(8, 11), @(9, 11),
            @(8, 12), @(9, 12),
            @(8, 13), @(9, 13)
        )
        Set-Pixels $lightBlue @(
            @(7, 13), @(10, 13),
            @(7, 14), @(8, 14), @(9, 14), @(10, 14),
            @(8, 15), @(9, 15)
        )
        Set-Pixels $blue @(@(8, 16), @(9, 16), @(8, 17), @(9, 17))

        # Keep the output port crisp against the bottom bevel.
        Set-Pixels $black @(@(7, 15), @(10, 15))

        $sprite.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $sprite.Dispose()
    }
} finally {
    $source.Dispose()
}

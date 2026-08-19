param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::FromFile($InputPath)
try {
    $left = $source.Width
    $top = $source.Height
    $right = -1
    $bottom = -1

    for ($y = 0; $y -lt $source.Height; $y++) {
        for ($x = 0; $x -lt $source.Width; $x++) {
            $pixel = $source.GetPixel($x, $y)
            if ($pixel.R -lt 175 -or $pixel.G -lt 175 -or $pixel.B -lt 175) {
                $left = [Math]::Min($left, $x)
                $top = [Math]::Min($top, $y)
                $right = [Math]::Max($right, $x)
                $bottom = [Math]::Max($bottom, $y)
            }
        }
    }

    if ($right -lt $left -or $bottom -lt $top) {
        throw "No sprite content was found."
    }

    $contentWidth = $right - $left + 1
    $contentHeight = $bottom - $top + 1
    $side = [Math]::Max($contentWidth, $contentHeight)
    $padding = [Math]::Max(8, [int]($side * 0.035))
    $side += $padding * 2
    $cropX = [Math]::Max(0, [int](($left + $right - $side + 1) / 2))
    $cropY = [Math]::Max(0, [int](($top + $bottom - $side + 1) / 2))
    $side = [Math]::Min($side, [Math]::Min($source.Width - $cropX, $source.Height - $cropY))

    $clean = New-Object System.Drawing.Bitmap $side, $side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        for ($y = 0; $y -lt $side; $y++) {
            for ($x = 0; $x -lt $side; $x++) {
                $pixel = $source.GetPixel($cropX + $x, $cropY + $y)
                if ($pixel.R -ge 175 -and $pixel.G -ge 175 -and $pixel.B -ge 175) {
                    $clean.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
                } else {
                    $clean.SetPixel($x, $y, $pixel)
                }
            }
        }

        $output = New-Object System.Drawing.Bitmap 18, 18, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($output)
            try {
                $graphics.Clear([System.Drawing.Color]::Transparent)
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
                $graphics.DrawImage($clean, (New-Object System.Drawing.Rectangle 1, 1, 16, 16), 0, 0, $side, $side, [System.Drawing.GraphicsUnit]::Pixel)
            } finally {
                $graphics.Dispose()
            }

            $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        } finally {
            $output.Dispose()
        }
    } finally {
        $clean.Dispose()
    }
} finally {
    $source.Dispose()
}

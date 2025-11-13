# Скрипт для перемещения всех TGS файлов подарков в папку gifts

# Создать папку gifts, если её нет
$giftsFolder = "src\assets\tgs\gifts"
if (-not (Test-Path $giftsFolder)) {
    New-Item -ItemType Directory -Path $giftsFolder -Force | Out-Null
    Write-Host "Создана папка: $giftsFolder"
}

# Список всех файлов подарков
$gifts = @(
    'heart',
    'bear',
    'giftsp',
    'rose',
    'cake',
    'buket',
    'rocket',
    'champion',
    '100star',
    'dimond',
    'bytilka',
    'snoopdog',
    'swagbag',
    'snoopcigar',
    'lowrider',
    'wetsidesign',
    'icecream',
    'easteregg',
    'springbasket',
    'stellarrocket',
    'artisanbrick',
    'jack-in-the-box',
    'jollychimp',
    'happybrownie',
    'instantramen',
    'faithamulet',
    'moonpendant',
    'cloverpin',
    'nekohelmet',
    'ionicdryver',
    'whipcupcake',
    'moussecake',
    'mightyarm',
    'heroichelmet',
    'tophat',
    'bowtie',
    'lightsword',
    'freshsocks',
    'imputkey',
    'plushpepe'
)

$movedCount = 0
$notFoundCount = 0

foreach ($gift in $gifts) {
    $sourceFile = "src\assets\tgs\$gift.tgs"
    $destFile = "$giftsFolder\$gift.tgs"
    
    if (Test-Path $sourceFile) {
        Move-Item -Path $sourceFile -Destination $destFile -Force
        Write-Host "Перемещен: $gift.tgs"
        $movedCount++
    } else {
        Write-Host "Не найден: $gift.tgs" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host "`nГотово! Перемещено файлов: $movedCount, не найдено: $notFoundCount" -ForegroundColor Green


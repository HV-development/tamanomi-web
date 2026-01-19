/**
 * LP画像最適化スクリプト
 * 
 * PNG/JPG画像をWebPに変換し、ファイルサイズを大幅に削減します。
 * 
 * 使い方:
 *   node scripts/optimize-images.js
 * 
 * オプション:
 *   --dry-run    実際の変換を行わず、対象ファイルと予想サイズを表示
 *   --quality=N  WebP品質を指定（デフォルト: 85）
 *   --max-width=N 最大幅を指定（デフォルト: 2000）
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
  // 対象ディレクトリ
  targetDir: path.join(__dirname, '../public/lp/images'),
  
  // 出力ディレクトリ（同じディレクトリに上書き）
  outputDir: path.join(__dirname, '../public/lp/images'),
  
  // バックアップディレクトリ
  backupDir: path.join(__dirname, '../public/lp/images-backup'),
  
  // 対象拡張子
  extensions: ['.png', '.jpg', '.jpeg'],
  
  // WebP品質（0-100）
  quality: 85,
  
  // 最大幅（ピクセル）- これより大きい画像はリサイズ
  maxWidth: 2000,
  
  // 最大高さ（ピクセル）
  maxHeight: 2000,
  
  // ファーストビュー画像は高品質を維持
  highQualityPatterns: ['fv', 'hero', 'banner'],
  highQuality: 90,
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const qualityArg = args.find(arg => arg.startsWith('--quality='));
const maxWidthArg = args.find(arg => arg.startsWith('--max-width='));

if (qualityArg) {
  CONFIG.quality = parseInt(qualityArg.split('=')[1], 10);
}
if (maxWidthArg) {
  CONFIG.maxWidth = parseInt(maxWidthArg.split('=')[1], 10);
}

// ファイルサイズをフォーマット
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// 削減率を計算
function calcReduction(original, optimized) {
  const reduction = ((original - optimized) / original) * 100;
  return `${reduction.toFixed(1)}%`;
}

// 画像を最適化
async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(CONFIG.outputDir, `${basename}.webp`);
  
  // 元のファイルサイズを取得
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;
  
  // 高品質パターンかチェック
  const isHighQuality = CONFIG.highQualityPatterns.some(pattern => 
    basename.toLowerCase().includes(pattern)
  );
  const quality = isHighQuality ? CONFIG.highQuality : CONFIG.quality;
  
  try {
    // 画像のメタデータを取得
    const metadata = await sharp(inputPath).metadata();
    
    // リサイズが必要かチェック
    let resizeOptions = {};
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      resizeOptions = {
        width: Math.min(metadata.width, CONFIG.maxWidth),
        height: Math.min(metadata.height, CONFIG.maxHeight),
        fit: 'inside',
        withoutEnlargement: true,
      };
    }
    
    if (isDryRun) {
      // ドライラン：変換をシミュレート
      const tempBuffer = await sharp(inputPath)
        .resize(resizeOptions.width, resizeOptions.height, {
          fit: resizeOptions.fit,
          withoutEnlargement: resizeOptions.withoutEnlargement,
        })
        .webp({ quality })
        .toBuffer();
      
      return {
        input: inputPath,
        output: outputPath,
        originalSize,
        optimizedSize: tempBuffer.length,
        width: metadata.width,
        height: metadata.height,
        quality,
        skipped: false,
      };
    }
    
    // 実際の変換
    let pipeline = sharp(inputPath);
    
    if (resizeOptions.width) {
      pipeline = pipeline.resize(resizeOptions.width, resizeOptions.height, {
        fit: resizeOptions.fit,
        withoutEnlargement: resizeOptions.withoutEnlargement,
      });
    }
    
    await pipeline.webp({ quality }).toFile(outputPath);
    
    const optimizedStats = fs.statSync(outputPath);
    
    return {
      input: inputPath,
      output: outputPath,
      originalSize,
      optimizedSize: optimizedStats.size,
      width: metadata.width,
      height: metadata.height,
      quality,
      skipped: false,
    };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return {
      input: inputPath,
      output: outputPath,
      originalSize,
      optimizedSize: originalSize,
      error: error.message,
      skipped: true,
    };
  }
}

// ディレクトリ内の対象ファイルを取得
function getTargetFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // サブディレクトリは無視（バックアップディレクトリなど）
      continue;
    }
    
    const ext = path.extname(item.name).toLowerCase();
    if (CONFIG.extensions.includes(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// バックアップを作成
async function createBackup(files) {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  console.log(`\nバックアップを作成中: ${CONFIG.backupDir}`);
  
  for (const file of files) {
    const basename = path.basename(file);
    const backupPath = path.join(CONFIG.backupDir, basename);
    fs.copyFileSync(file, backupPath);
  }
  
  console.log(`${files.length}ファイルをバックアップしました\n`);
}

// メイン処理
async function main() {
  console.log('='.repeat(60));
  console.log('LP画像最適化スクリプト');
  console.log('='.repeat(60));
  console.log(`\n対象ディレクトリ: ${CONFIG.targetDir}`);
  console.log(`WebP品質: ${CONFIG.quality} (高品質画像: ${CONFIG.highQuality})`);
  console.log(`最大サイズ: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
  
  if (isDryRun) {
    console.log('\n[ドライラン] 実際の変換は行いません\n');
  }
  
  // 対象ファイルを取得
  const files = getTargetFiles(CONFIG.targetDir);
  
  if (files.length === 0) {
    console.log('\n対象ファイルが見つかりませんでした。');
    return;
  }
  
  console.log(`\n対象ファイル: ${files.length}件\n`);
  
  // バックアップを作成（ドライランでない場合）
  if (!isDryRun) {
    await createBackup(files);
  }
  
  // 結果を格納
  const results = [];
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  // 各ファイルを処理
  for (const file of files) {
    const basename = path.basename(file);
    process.stdout.write(`処理中: ${basename}...`);
    
    const result = await optimizeImage(file);
    results.push(result);
    
    if (!result.skipped) {
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      console.log(` ${formatSize(result.originalSize)} → ${formatSize(result.optimizedSize)} (${calcReduction(result.originalSize, result.optimizedSize)}削減)`);
    } else {
      console.log(` スキップ: ${result.error}`);
    }
  }
  
  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('結果サマリー');
  console.log('='.repeat(60));
  console.log(`処理ファイル数: ${results.filter(r => !r.skipped).length}/${files.length}`);
  console.log(`元のサイズ合計: ${formatSize(totalOriginal)}`);
  console.log(`最適化後サイズ: ${formatSize(totalOptimized)}`);
  console.log(`削減サイズ: ${formatSize(totalOriginal - totalOptimized)} (${calcReduction(totalOriginal, totalOptimized)}削減)`);
  
  if (!isDryRun) {
    console.log(`\nバックアップ: ${CONFIG.backupDir}`);
    console.log('\n注意: 元のPNG/JPGファイルは残っています。');
    console.log('WebPファイルの動作確認後、不要なPNG/JPGファイルを削除してください。');
    console.log('\nコード内の画像参照も .webp に更新する必要があります。');
  } else {
    console.log('\n[ドライラン完了] 実際に変換するには --dry-run オプションを外して実行してください。');
  }
}

// 実行
main().catch(console.error);

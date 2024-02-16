const fs = require('fs');
const SBP_FOLDER_PATH = './SBP';
const WEM_FOLDER_PATH = './WEM';
const OUTPUT_PATH = './output';
const SBP_FILES = fs.readdirSync(SBP_FOLDER_PATH);
const WEM_FILES = fs.readdirSync(WEM_FOLDER_PATH);

function getFileName(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
}

function removeFileExt(str) {
    return str.replace(/\.[^/.]+$/, "");
}

SBP_FILES.forEach(sbpFileName => {
    const sbp = fs.readFileSync(`${SBP_FOLDER_PATH}/${sbpFileName}`);
    const outputSbpFolderPath = `${OUTPUT_PATH}/${removeFileExt(sbpFileName)}`;
    if (!fs.existsSync(outputSbpFolderPath)) fs.mkdirSync(outputSbpFolderPath, {
        recursive: true
    });
    const searchBytes = Buffer.from([0x01, 0x00, 0x0C, 0x00, 0x02]);
    let lastSearchBytesIndex = 0;
    while (true) {
        const searchBytesIndex = sbp.indexOf(searchBytes, lastSearchBytesIndex);
        if (searchBytesIndex == -1) break;
        const wemFileNameBytesIndex = searchBytesIndex + searchBytes.length;
        lastSearchBytesIndex = wemFileNameBytesIndex;
        const wemFileNameBytes = sbp.slice(wemFileNameBytesIndex, wemFileNameBytesIndex + 4);
        const wemFileName = `0x${wemFileNameBytes.reverse().toString('hex').toUpperCase()}.wem`;
        const wemFileIndex = WEM_FILES.indexOf(wemFileName);
        if (wemFileIndex != -1) {
            try {
                fs.renameSync(`${WEM_FOLDER_PATH}/${wemFileName}`, `${outputSbpFolderPath}/${wemFileName}`);
            } catch {}
        }
    }
});
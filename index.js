const exifRenamer = require('exif-renamer')();
const fs = require('fs');
const dateFormat = require('dateformat'); // the dependency

const inputDir = '{somedir}/input';

exifRenamer.config.dryrun = true;

function getExifOriginalDate(path) {
    exifRenamer.exif(path, (err, exifData) => {
        if (err) {
            return end(err);
        }
    
        if (exifData && exifData.exif) {
            const datetime = exifData.exif.DateTimeOriginal;
            if (!datetime) {
                const err = `cannot get datetime for this file: ${path}`;
                return end(err);
            } else {
                const dateObj = new Date(datetime * 1000);
                const name = dateFormat(dateObj, 'UTC:yyyymmdd_HHMMss');
                rename(path, name);
            }
        } else {
            const err = `cannot get EXIF for this file: ${path}`;
            return end(err);
        }
    });
}

function rename(path, name) {
    if (!path || !name) {
        return end('path and name are required!');
    }

    exifRenamer.rename(path, '../output/' + name + '.{{EXT}}', (err, result) => {
        if (err) {
            return end(err);
        }

        console.info(`transferring from ${path} to ${result.processed.path} succeeded!`);
    });
}

function end(err) {
    let status = 0;
    if (err) {
        console.error(err);
        status = 1;
    }

    console.info('\r\nrunning completed');
    return status;
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    // let count = 0;
    for (const i in files) {
        const filepath = `${inputDir}${files[i]}`;
        getExifOriginalDate(filepath);

        // count ++;
        // if (count >= 100) {
        //     break;
        // }
    }

    end(); 
});


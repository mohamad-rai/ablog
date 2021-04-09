const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");

const config = require('../config/const');

// Gets a filename extension.
function getExtension(filename) {
    return filename.split(".").pop();
}

// Test if a image is valid based on its extension and mime type.
function isImageValid(filename, mimetype) {
    const allowedExts = ["gif", "jpeg", "jpg", "png", "svg", "blob"];
    const allowedMimeTypes = ["image/gif", "image/jpeg", "image/pjpeg", "image/x-png", "image/png", "image/svg+xml"];

    // Get image extension.
    const extension = getExtension(filename);

    return allowedExts.indexOf(extension.toLowerCase()) !== -1  &&
        allowedMimeTypes.indexOf(mimetype) !== -1;
}

function upload (req, callback) {
    // The route on which the image is saved.
    const fileRoute = config.EDITOR_IMAGE_PATH;

    // Server side file path on which the image is saved.
    let saveToPath = null;

    // Flag to tell if a stream had an error.
    let hadStreamError = null;

    // Used for sending response.
    let link = null;

    let busboy;

    // Stream error handler.
    function handleStreamError(error) {
        // Do not enter twice in here.
        if (hadStreamError) {
            return;
        }

        hadStreamError = error;

        // Cleanup: delete the saved path.
        if (saveToPath) {
            return fs.unlink(saveToPath, function (err) {
                return callback(error);
            });
        }

        return callback(error);
    }

    // Instantiate Busboy.
    try {
        busboy = new Busboy({ headers: req.headers });
    } catch(e) {
        return callback(e);
    }

    // Handle file arrival.
    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        // Check fieldname:
        if ("file" !== fieldname) {
            // Stop receiving from this stream.
            file.resume();
            return callback("FieldName is not correct. It must be "+file+".");
        }

        // Generate link.
        const randomName = `${req.session.user.username}_${Date.now()}.${getExtension(filename)}`;
        link = fileRoute + randomName;

        // Generate path where the file will be saved.
        const appDir = path.dirname(require.main.filename);
        saveToPath = path.join(appDir, link);

        // Pipe reader stream (file from client) into writer stream (file from disk).
        file.on("error", handleStreamError);

        // Create stream writer to save to file to disk.
        const diskWriterStream = fs.createWriteStream(saveToPath);
        diskWriterStream.on("error", handleStreamError);

        // Validate image after it is successfully saved to disk.
        diskWriterStream.on("finish", function() {
            // Check if image is valid
            const status = isImageValid(saveToPath, mimetype);

            if (!status) {
                return handleStreamError("File does not meet the validation.");
            }

            return callback(null, {link: link.substr(9)});
        });

        // Save image to disk.
        file.pipe(diskWriterStream);
    });

    // Handle file upload termination.
    busboy.on("error", handleStreamError);
    req.on("error", handleStreamError);

    // Pipe reader stream into writer stream.
    return req.pipe(busboy);
}

module.exports = upload;
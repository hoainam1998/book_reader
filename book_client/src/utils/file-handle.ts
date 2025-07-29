/**
 * Return extension from blob type.
 *
 * @param {string} blobType - base64 string present image.
 * @returns {string} - extension name.
 */
const getExtnameFromBlobType = (blobType: string): string => {
  const matches: RegExpMatchArray | null = blobType.match(/(\/\w+)/);
  return matches ? matches[0].replace('/', '.') : '';
};

/**
 * Return promise of file from base64 string.
 *
 * @param {string} imageBase64String - base64 string present image.
 * @param {string} name - file name.
 * @returns {Promise<File>} - promise file.
 */
const convertBase64ToSingleFile = (imageBase64String: string, name: string): Promise<File> => {
  return fetch(imageBase64String)
    .then((res) => res.blob())
    .then((blob) => {
      if (name.search(/\.\w+/) < 0) {
        const ext: string = getExtnameFromBlobType(blob.type);
        name = `${name}${ext}`;
      }
      return new File([blob], name, { type: blob.type });
    });
};

/**
 * Convert file path string list to json content promise.
 *
 * @param {string} filePath - The file path.
 * @returns {Promise} - The json content promise.
 */
const getJsonFileContent = <T>(filePath: string): Promise<T> => {
  return fetch(`${process.env.BASE_URL}/${filePath}`)
    .then(res => res.json())
    .then(json => json);
};

/**
 * Open a file on new page.
 *
 * @param {string} file - The file path.
 */
const openFile = (file: string): void => {
  window.open(`${process.env.BASE_URL}/${file}`, '_blank');
};

export {
  getJsonFileContent,
  getExtnameFromBlobType,
  convertBase64ToSingleFile,
  openFile
};
export const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

export const pickFilesAsDataUrls = async (fileList) => {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(async (f) => ({
      name: f.name, size: f.size, type: f.type,
      dataUrl: await readAsDataURL(f),
    }))
  );
};

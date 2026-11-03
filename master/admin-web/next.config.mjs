import fs from "node:fs";

// Windows NTFS EPERM race-condition patch for concurrent recursive mkdir (both callback and promise)
const origMkdir = fs.mkdir;
const origPromisesMkdir = fs.promises.mkdir;

if (!globalThis.__fs_mkdir_patched) {
  globalThis.__fs_mkdir_patched = true;

  fs.mkdir = function (dir, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    origMkdir.call(fs, dir, options, (err) => {
      if (err && (err.code === "EPERM" || err.code === "EEXIST") && fs.existsSync(dir)) {
        return callback ? callback(null) : undefined;
      }
      if (err && err.code === "EPERM") {
        setTimeout(() => {
          if (fs.existsSync(dir)) return callback ? callback(null) : undefined;
          origMkdir.call(fs, dir, options, (err2) => {
            if (err2 && fs.existsSync(dir)) return callback ? callback(null) : undefined;
            if (callback) callback(err2);
          });
        }, 50);
        return;
      }
      if (callback) callback(err);
    });
  };

  fs.promises.mkdir = async function (dir, options) {
    try {
      return await origPromisesMkdir.call(this, dir, options);
    } catch (err) {
      if (err && (err.code === "EPERM" || err.code === "EEXIST") && fs.existsSync(dir)) {
        return dir;
      }
      if (err && err.code === "EPERM") {
        await new Promise((r) => setTimeout(r, 50));
        if (fs.existsSync(dir)) return dir;
        try {
          return await origPromisesMkdir.call(this, dir, options);
        } catch (retryErr) {
          if (fs.existsSync(dir)) return dir;
          throw retryErr;
        }
      }
      throw err;
    }
  };
}

const currentFileUrl = import.meta.url;
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes(currentFileUrl)) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --import ${currentFileUrl}`.trim();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;

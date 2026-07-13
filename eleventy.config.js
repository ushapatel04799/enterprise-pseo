export default function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(['njk', 'html']);
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addWatchTarget('./src/assets');

  return {
    dir: {
      input: 'src',
      output: 'output',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
    },
  };
}

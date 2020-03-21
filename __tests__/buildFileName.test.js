import {buildFileName} from '../src/utils';

test('should build filename and dirname from href 1', () => {
  const href = 'https://ru.hexlet.io/blog/posts/vyshel-laravel-7';
  const expectedFilename = 'ru_hexlet_io_blog_posts_vyshel_laravel_7.html';
  const expectedDirname = 'ru_hexlet_io_blog_posts_vyshel_laravel_7_files';
  const {filename, dirname} = buildFileName(href);
  expect(filename).toBe(expectedFilename);
  expect(dirname).toBe(expectedDirname);
});

test('should build filename and dirname from href 2', () => {
  const href = 'https://ru.hexlet.io/projects/4/members/7386?check_point_id=57789';
  const expectedFilename = 'ru_hexlet_io_projects_4_members_7386_check_point_id_57789.html';
  const expectedDirname = 'ru_hexlet_io_projects_4_members_7386_check_point_id_57789_files';
  const {filename, dirname} = buildFileName(href);
  expect(filename).toBe(expectedFilename);
  expect(dirname).toBe(expectedDirname);
});

test('should build filename and dirname from href 3', () => {
  const href = 'https://weary-fan.surge.sh';
  const expectedFilename = 'weary_fan_surge_sh_.html';
  const expectedDirname = 'weary_fan_surge_sh__files';
  const {filename, dirname} = buildFileName(href);
  expect(filename).toBe(expectedFilename);
  expect(dirname).toBe(expectedDirname);
});

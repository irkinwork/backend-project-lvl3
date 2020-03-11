import buildFileName from '../src/utils/buildFileName';

test('should build filename from href 1', () => {
  const href = 'https://ru.hexlet.io/blog/posts/vyshel-laravel-7';
  const filename = 'ru_hexlet_io_blog_posts_vyshel_laravel_7.html';
  expect(buildFileName(href)).toBe(filename);
});

test('should build filename from href 2', () => {
  const href = 'https://ru.hexlet.io/projects/4/members/7386?check_point_id=57789';
  const filename = 'ru_hexlet_io_projects_4_members_7386_check_point_id_57789.html';
  expect(buildFileName(href)).toBe(filename);
});

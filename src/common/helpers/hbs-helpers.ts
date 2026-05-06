type HbsHelper = (...args: unknown[]) => unknown;
type HbsInstance = { registerHelper: (name: string, fn: HbsHelper) => void };

export function registerHbsHelpers(hbs: HbsInstance): void {
  hbs.registerHelper('formatDate', (...args: unknown[]) => {
    const date = args[0] as Date | string | undefined;
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  hbs.registerHelper('excerpt', (...args: unknown[]) => {
    const body = args[0] as string | undefined;
    const length = args[1] as number | undefined;
    if (!body) return '';
    const max = typeof length === 'number' ? length : 200;
    const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > max ? text.substring(0, max) + '...' : text;
  });

  hbs.registerHelper('eq', (...args: unknown[]) => args[0] === args[1]);

  hbs.registerHelper('includes', (...args: unknown[]) => {
    const arr = args[0];
    if (!Array.isArray(arr)) return false;
    return arr.includes(args[1]);
  });

  hbs.registerHelper('range', (...args: unknown[]) => {
    const start = args[0] as number;
    const end = args[1] as number;
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  });

  hbs.registerHelper('add', (...args: unknown[]) => (args[0] as number) + (args[1] as number));
  hbs.registerHelper('subtract', (...args: unknown[]) => (args[0] as number) - (args[1] as number));
  hbs.registerHelper('gt', (...args: unknown[]) => (args[0] as number) > (args[1] as number));
  hbs.registerHelper('lt', (...args: unknown[]) => (args[0] as number) < (args[1] as number));

  hbs.registerHelper('tagIcon', (...args: unknown[]) => {
    const slug = args[0] as string | undefined;
    const icons: Record<string, string> = {
      nestjs: '\uD83D\uDE80',
      typescript: '\uD83D\uDCA1',
      tutorial: '\uD83D\uDCD6',
      css: '\uD83C\uDFA8',
      database: '\uD83D\uDDC4\uFE0F',
      javascript: '\u26A1',
      nodejs: '\uD83D\uDFE2',
      react: '\u269B\uFE0F',
      vue: '\uD83D\uDC9A',
      seo: '\uD83D\uDD0D',
      marketing: '\uD83D\uDCCA',
    };
    return (slug && icons[slug]) ? icons[slug] : '\uD83D\uDCDD';
  });
}

// components/seo/json-ld.tsx
//
// Renders a single <script type="application/ld+json"> block from a typed
// object. Use one <JsonLd /> per schema entity — don't merge unrelated
// schemas into one @graph unless you're intentionally doing so (Organization
// + WebSite in the root layout is a fine exception; see docs/seo/07-STRUCTURED-DATA.md).

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

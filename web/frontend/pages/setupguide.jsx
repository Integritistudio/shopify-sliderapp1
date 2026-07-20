"use client"

import { Page, Card, Text, Stack, Banner } from "@shopify/polaris"

export default function UserGuide() {
  const steps = [
    {
      title: "Create a slider",
      description: "Open SlideEase and click Create slider. Choose a name and preset (center, fade, autoplay, and more). A sample preview appears immediately.",
    },
    {
      title: "Add slides with Shopify images or video",
      description:
        "Open the slider editor, click Add slide, then Choose from Shopify Files — or drag-and-drop to upload. Switch to Video for YouTube, Vimeo, or Shopify videos. Pick product/collection CTAs with the resource picker.",
    },
    {
      title: "Customize each slide",
      description:
        "Set heading, subheading, description, CTA text/URL, overlay, text colors, and alignment. Drag slides to reorder, hide slides, or open CTAs in a new tab.",
    },
    {
      title: "Tune style and behavior",
      description:
        "Use the Style & behavior tab for height, corner radius, image fit, autoplay timing, arrows/dots, colors, and mobile overrides. Check the realistic mobile phone preview (swipe supported).",
    },
    {
      title: "Publish and copy the ID",
      description: "Set status to Published, open the Publish tab, and copy the numeric Slider ID.",
    },
    {
      title: "Add the theme app block",
      description:
        "Online Store → Themes → Customize → Add section → Apps → SlideEase Slider. Paste the Slider ID, optionally set a heading and spacing, then save. Mark embed done on the Publish tab when finished.",
    },
  ]

  return (
    <Page title="SlideEase setup guide" subtitle="Build polished sliders with Shopify Files, CTAs, and live previews">
      <Stack vertical spacing="loose">
        <Banner title="Enhanced editor" status="info">
          <p>
            SlideEase now supports multiple sliders, Shopify Files image picking, per-slide CTAs, advanced style options,
            and a live sample preview before you publish.
          </p>
        </Banner>

        {steps.map((step, index) => (
          <Card key={step.title} sectioned>
            <Stack vertical spacing="tight">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    backgroundColor: "#1a2f4a",
                    color: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>
                <Text variant="headingMd" as="h3">
                  {step.title}
                </Text>
              </div>
              <Text color="subdued">{step.description}</Text>
            </Stack>
          </Card>
        ))}

        <Card sectioned>
          <Stack vertical spacing="tight">
            <Text variant="headingMd" as="h3">
              Need help?
            </Text>
            <Text>
              If files do not appear or uploads fail, reinstall the app so it can request{" "}
              <strong>read_files</strong> and <strong>write_files</strong>. Contact support at info@integriti.io.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Page>
  )
}


import { Page, Card, Text, Stack, Button, Banner, Image, Badge } from "@shopify/polaris"

export default function UserGuide() {
  const sliderId = "slider_12345"


  const steps = [
    {
      title: "Create Slider",
      description: "Go to Sliders and click on create slider",
      screenshot: "/assets/1-screenshot.PNG",
    },
    {
      title: "Slider Settings",
      description: "Add slider name, select slider type and click on create Slider",
      screenshot: "/assets/2-screenshot.PNG",
    },
    {
      title: "Add slide to the slider",
      description: 'Click "Add new slide" to add slide to the slider',
      screenshot: "/assets/3-screenshot.PNG",
    },
    {
      title: "Add data to slide ",
      description: "Add the slide data like Image URL ,Title, Description ",
      screenshot: "/assets/4-screenshot.PNG",
    },
    {
      title: "Slider Preview and get code",
      description: "Assuming you have three slides, the slider will appear as shown. Click Get Code to copy its slider ID.",
      screenshot: "/assets/5-screenshot.PNG",
    },
    {
      title: "Generate Slider Id",
      description: "Click on Genrate Code button to get the slider id",
      screenshot: "/assets/6-screenshot.PNG",
    },
    {
      title: "Copy Generated Slider ID",
      description: "Click the **Copy** button to copy the slider ID.",
      screenshot: "/assets/6-screenshot.PNG",
    },
    {
      title: "Add slider section in theme customizer",
      description: "Go to Online Store > Themes > Customize and add section SlideEase Slider From Apps",
      screenshot: "/assets/7-screenshot.PNG",
    }
  ]

  return (
    <Page title="SlideEase Setup Guide" subtitle="Follow these simple steps to add your slider to your Shopify store">
      <Stack vertical spacing="loose">
        <Banner title="Quick Setup in 6 Steps" status="info">
          <p>
            This guide will walk you through creating your SlideEase slider. Each step includes visual
            references to help you along the way.
          </p>
        </Banner>

        {steps.map((step, index) => (
          <Card key={index} sectioned>
            <Stack vertical spacing="base">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    backgroundColor: "#008060",
                    color: "white",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {index + 1}
                </div>
                <Text variant="headingMd" as="h3">
                  {step.title}
                </Text>
              </div>

              <Text variant="bodyMd" color="subdued">
                {step.description}
              </Text>

              {step.action && step.action}

              <div
                style={{
                  border: "2px solid #e1e3e5",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#fafbfb",
                  marginTop: "16px",
                }}
              >
                <Image
                  source={step.screenshot}
                  alt={`Step ${index + 1}: ${step.title}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    border: "1px solid #e1e3e5",
                  }}
                />
              </div>
            </Stack>
          </Card>
        ))}

        <Card sectioned>
          <Stack vertical spacing="base">
            <Text variant="headingMd" as="h3">
              Need Help?
            </Text>
            <Text variant="bodyMd">
              If you encounter any issues during setup, don't hesitate to reach out to our support team at info@integriti.io.
            </Text>

          </Stack>
        </Card>
      </Stack>
    </Page>
  )
}

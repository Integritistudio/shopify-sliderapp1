// "use client"

// import { useState, useEffect } from "react"
// import { Modal, Card, Stack, Text, Banner, Button } from "@shopify/polaris"

// export default function AddToThemeModal({ isOpen, onClose, slider, onDeploy }) {
//   const [isLoading, setIsLoading] = useState(false)
//   const [deploymentResult, setDeploymentResult] = useState(null)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     if (isOpen) {
//       setDeploymentResult(null)
//       setError(null)
//     }
//   }, [isOpen])

//   const handleGenerateCode = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       // Generate simple script without deployment tracking
//       const sliderLiquidCode = generateSimpleSliderCode(slider)

//       setDeploymentResult({
//         liquidCode: sliderLiquidCode,
//         instructions:
//           "Copy this code and paste it anywhere in your theme templates where you want the slider to appear.",
//       })

//       if (onDeploy) {
//         onDeploy()
//       }
//     } catch (err) {
//       console.error("Code generation error:", err)
//       setError(err.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleClose = () => {
//     setDeploymentResult(null)
//     setError(null)
//     onClose()
//   }

//   const generateSimpleSliderCode = (slider) => {
//     // Use current window location to build the URL
//     const currentDomain = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

//     // Create a simple script tag
//     return `<script src="${currentDomain}/slider-cdn.js?id=${slider.id}&type=${slider.sliderType}"></script>`
//   }

//   return (
//     <Modal
//       open={isOpen}
//       onClose={handleClose}
//       title={`Get Code for "${slider.name}"`}
//       large
//       primaryAction={{
//         content: deploymentResult ? "Close" : "Generate Code",
//         onAction: deploymentResult ? handleClose : handleGenerateCode,
//         loading: isLoading,
//         disabled: isLoading && !deploymentResult,
//       }}
//       secondaryActions={
//         !deploymentResult
//           ? [
//               {
//                 content: "Cancel",
//                 onAction: handleClose,
//               },
//             ]
//           : []
//       }
//     >
//       <Modal.Section>
//         <Stack vertical spacing="loose">
//           {error && (
//             <Banner status="critical" title="Error">
//               {error}
//             </Banner>
//           )}

//           {deploymentResult ? (
//             <Stack vertical spacing="loose">
//               <Banner status="success" title="Slider Code Generated Successfully!">
//                 Copy the code below and paste it anywhere in your Shopify theme where you want the slider to appear.
//               </Banner>

//               <Card sectioned>
//                 <Stack vertical spacing="tight">
//                   <Text variant="headingSm">How to Use</Text>
//                   <Text>1. Copy the code below</Text>
//                   <Text>2. Go to your Shopify Admin → Online Store → Themes → Actions → Edit Code</Text>
//                   <Text>3. Open any template file (index.liquid, product.liquid, collection.liquid, etc.)</Text>
//                   <Text>4. Paste the code where you want the slider to appear</Text>
//                   <Text>5. Save the file</Text>
//                 </Stack>
//               </Card>

//               <Card sectioned>
//                 <Stack vertical spacing="tight">
//                   <Stack alignment="center" distribution="equalSpacing">
//                     <Text variant="headingSm">Your Slider Code</Text>
//                     <Button
//                       onClick={() => {
//                         navigator.clipboard.writeText(deploymentResult.liquidCode)
//                         alert("Code copied to clipboard!")
//                       }}
//                       size="slim"
//                     >
//                       Copy Code
//                     </Button>
//                   </Stack>
//                   <div
//                     style={{
//                       backgroundColor: "#f6f6f7",
//                       padding: "1rem",
//                       borderRadius: "4px",
//                       fontFamily: "monospace",
//                       fontSize: "16px",
//                       fontWeight: "bold",
//                       border: "2px solid #008060",
//                       textAlign: "center",
//                       color: "#004c3f",
//                     }}
//                   >
//                     {deploymentResult.liquidCode}
//                   </div>
//                 </Stack>
//               </Card>

//               <Banner status="info" title="Placement Tips">
//                 <Stack vertical spacing="tight">
//                   <Text>
//                     • <strong>Homepage:</strong> Add to templates/index.liquid
//                   </Text>
//                   <Text>
//                     • <strong>Product pages:</strong> Add to templates/product.liquid
//                   </Text>
//                   <Text>
//                     • <strong>Collection pages:</strong> Add to templates/collection.liquid
//                   </Text>
//                   <Text>
//                     • <strong>All pages:</strong> Add to layout/theme.liquid
//                   </Text>
//                 </Stack>
//               </Banner>
//             </Stack>
//           ) : (
//             <Stack vertical spacing="loose">
//               <Text variant="headingSm">Generate Slider Code</Text>

//               <Card sectioned>
//                 <Stack vertical spacing="tight">
//                   <Text variant="headingSm">Slider Details</Text>
//                   <Text>
//                     <strong>Name:</strong> {slider.name}
//                   </Text>
//                   <Text>
//                     <strong>Type:</strong> {slider.sliderType}
//                   </Text>
//                   <Text>
//                     <strong>Slides:</strong> {slider.slides?.length || 0} slides
//                   </Text>
//                 </Stack>
//               </Card>

//               <Banner status="info" title="Simple Integration">
//                 <p>
//                   Get a simple one-line code that you can paste anywhere in your Shopify theme. No complex setup
//                   required - just copy and paste!
//                 </p>
//               </Banner>
//             </Stack>
//           )}
//         </Stack>
//       </Modal.Section>
//     </Modal>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Modal, Card, Stack, Text, Banner, Button } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function AddToThemeModal({ isOpen, onClose, slider, onDeploy }) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setDeploymentResult(null)
      setError(null)
    }
  }, [isOpen])

  const handleGenerateCode = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate simple script without deployment tracking
      const sliderLiquidCode = generateSimpleSliderCode(slider)

      setDeploymentResult({
        liquidCode: sliderLiquidCode,
        instructions:
          "Copy this code and paste it anywhere in your theme templates where you want the slider to appear.",
      })

      if (onDeploy) {
        onDeploy()
      }

      showToast("Slider code generated successfully! 🎉")
    } catch (err) {
      console.error("Code generation error:", err)
      const errorMessage = err.message || "Failed to generate slider code"
      setError(errorMessage)
      showToast(`Error: ${errorMessage}`, { error: true })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDeploymentResult(null)
    setError(null)
    onClose()
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(deploymentResult.liquidCode)
      showToast("Code copied to clipboard! 📋")
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      showToast("Failed to copy code. Please select and copy manually.", { error: true })

      // Fallback: select the text
      const codeElement = document.querySelector(".slider-code-display")
      if (codeElement) {
        const range = document.createRange()
        range.selectNodeContents(codeElement)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  const generateSimpleSliderCode = (slider) => {
    // Use current window location to build the URL
    const currentDomain = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    // Create a simple script tag
    return `<script src="${currentDomain}/slider-cdn.js?id=${slider.id}&type=${slider.sliderType}"></script>`
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={`Get Code for "${slider.name}"`}
      large
      primaryAction={{
        content: deploymentResult ? "Close" : "Generate Code",
        onAction: deploymentResult ? handleClose : handleGenerateCode,
        loading: isLoading,
        disabled: isLoading && !deploymentResult,
      }}
      secondaryActions={
        !deploymentResult
          ? [
              {
                content: "Cancel",
                onAction: handleClose,
              },
            ]
          : []
      }
    >
      <Modal.Section>
        <Stack vertical spacing="loose">
          {error && (
            <Banner status="critical" title="Generation Failed">
              {error}
            </Banner>
          )}

          {deploymentResult ? (
            <Stack vertical spacing="loose">
              <Banner status="success" title="Slider Code Generated Successfully! 🎉">
                Your slider is ready to be embedded! Copy the code below and paste it anywhere in your Shopify theme
                where you want the slider to appear.
              </Banner>

              <Card sectioned>
                <Stack vertical spacing="tight">
                  <Text variant="headingSm" fontWeight="semibold">
                    📋 How to Use This Code
                  </Text>
                  <div style={{ paddingLeft: "1rem" }}>
                    <Text>1. Copy the code below</Text>
                    <Text>2. Go to your Shopify Admin → Online Store → Themes → Actions → Edit Code</Text>
                    <Text>3. Open any template file (index.liquid, product.liquid, collection.liquid, etc.)</Text>
                    <Text>4. Paste the code where you want the slider to appear</Text>
                    <Text>5. Save the file and preview your store</Text>
                  </div>
                </Stack>
              </Card>

              <Card sectioned>
                <Stack vertical spacing="tight">
                  <Stack alignment="center" distribution="equalSpacing">
                    <Text variant="headingSm" fontWeight="semibold">
                      🚀 Your Slider Code
                    </Text>
                    <Button primary onClick={handleCopyCode} size="slim">
                      📋 Copy Code
                    </Button>
                  </Stack>

                  <div
                    className="slider-code-display"
                    style={{
                      backgroundColor: "#f6f6f7",
                      padding: "1.5rem",
                      borderRadius: "8px",
                      fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                      fontSize: "14px",
                      fontWeight: "600",
                      border: "2px solid #008060",
                      textAlign: "center",
                      color: "#004c3f",
                      wordBreak: "break-all",
                      userSelect: "all",
                      cursor: "text",
                    }}
                  >
                    {deploymentResult.liquidCode}
                  </div>

                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#e8f5e8",
                      borderRadius: "6px",
                      border: "1px solid #c3e6c3",
                    }}
                  >
                    <Text variant="bodySm" color="success">
                      💡 <strong>Pro Tip:</strong> This code will automatically load your slider with all its current
                      slides and settings. Any changes you make to the slider will be reflected automatically!
                    </Text>
                  </div>
                </Stack>
              </Card>

              <Banner status="info" title="📍 Placement Suggestions">
                <Stack vertical spacing="tight">
                  <Text>
                    • <strong>Homepage:</strong> Add to <code>templates/index.liquid</code>
                  </Text>
                  <Text>
                    • <strong>Product pages:</strong> Add to <code>templates/product.liquid</code>
                  </Text>
                  <Text>
                    • <strong>Collection pages:</strong> Add to <code>templates/collection.liquid</code>
                  </Text>
                  <Text>
                    • <strong>All pages:</strong> Add to <code>layout/theme.liquid</code>
                  </Text>
                </Stack>
              </Banner>
            </Stack>
          ) : (
            <Stack vertical spacing="loose">
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎠</div>
                <Text variant="headingMd" fontWeight="semibold">
                  Generate Slider Code
                </Text>
                <Text variant="bodyMd" color="subdued">
                  Get your slider code ready for Shopify integration
                </Text>
              </div>

              <Card sectioned>
                <Stack vertical spacing="tight">
                  <Text variant="headingSm" fontWeight="semibold">
                    📊 Slider Details
                  </Text>
                  <div style={{ paddingLeft: "1rem" }}>
                    <Text>
                      <strong>Name:</strong> {slider.name}
                    </Text>
                    <Text>
                      <strong>Type:</strong> {slider.sliderType}
                    </Text>
                    <Text>
                      <strong>Slides:</strong> {slider.slides?.length || 0} slides
                    </Text>
                  </div>
                </Stack>
              </Card>

              <Banner status="info" title="🚀 Simple Integration">
                <Text>
                  Get a simple one-line code that you can paste anywhere in your Shopify theme. No complex setup
                  required - just copy and paste! The slider will automatically load with all your current slides and
                  settings.
                </Text>
              </Banner>

              {slider.slides?.length === 0 && (
                <Banner status="warning" title="⚠️ No Slides Yet">
                  <Text>
                    Your slider doesn't have any slides yet. Add some slides first to make your slider more engaging!
                  </Text>
                </Banner>
              )}
            </Stack>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  )
}


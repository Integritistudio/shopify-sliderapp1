// "use client"

// import { useState, useEffect } from "react"
// import { Card, Stack, Text, Button, Badge, Modal, Banner } from "@shopify/polaris"

// export default function DeploymentManager({ slider, onRefresh }) {
//   const [deployments, setDeployments] = useState([])
//   const [pages, setPages] = useState([])
//   const [themes, setThemes] = useState([])
//   const [viewCodeModal, setViewCodeModal] = useState(null)
//   const [loadingStates, setLoadingStates] = useState({}) // Track loading for each deployment

//   useEffect(() => {
//     fetchDeployments()
//     fetchPages()
//     fetchThemes()
//   }, [slider.id])

//   const fetchDeployments = async () => {
//     try {
//       const response = await fetch(`/api/sliders/${slider.id}/deployments`)
//       if (response.ok) {
//         const data = await response.json()
//         setDeployments(data)
//       }
//     } catch (error) {
//       console.error("Failed to fetch deployments:", error)
//     }
//   }

//   const fetchPages = async () => {
//     try {
//       const response = await fetch("/api/pages")
//       if (response.ok) {
//         const data = await response.json()
//         setPages(data)
//       }
//     } catch (error) {
//       console.error("Failed to fetch pages:", error)
//     }
//   }

//   const fetchThemes = async () => {
//     try {
//       const response = await fetch("/api/themes")
//       if (response.ok) {
//         const data = await response.json()
//         setThemes(data)
//       }
//     } catch (error) {
//       console.error("Failed to fetch themes:", error)
//     }
//   }

//   const setDeploymentLoading = (deploymentId, loading) => {
//     setLoadingStates((prev) => ({
//       ...prev,
//       [deploymentId]: loading,
//     }))
//   }

//   const handleRemoveDeployment = async (deploymentId, deploymentInfo) => {
//     const confirmMessage = `Are you sure you want to remove this deployment?\n\nThis will remove the slider from:\n• Theme: ${deploymentInfo.themeName}\n• Page: ${getPageLabel(deploymentInfo.pageType)}\n• Position: ${deploymentInfo.position}\n\n${deploymentInfo.isAutoDeployed ? "The slider will be automatically removed from your theme." : "You'll need to manually remove the code from your theme."}`

//     if (confirm(confirmMessage)) {
//       try {
//         setDeploymentLoading(deploymentId, true)

//         const response = await fetch(`/api/deployments/${deploymentId}`, {
//           method: "DELETE",
//         })

//         if (!response.ok) {
//           throw new Error("Failed to remove deployment")
//         }

//         // Update local state immediately - no page reload needed
//         setDeployments((prev) => prev.filter((d) => d.id !== deploymentId))

//         // Notify parent component to update deployment count
//         if (onRefresh) {
//           onRefresh()
//         }
//       } catch (error) {
//         console.error("Failed to remove deployment:", error)
//         alert("Failed to remove deployment. Please try again.")
//       } finally {
//         setDeploymentLoading(deploymentId, false)
//       }
//     }
//   }

//   const handleViewCode = async (deployment) => {
//     try {
//       setDeploymentLoading(deployment.id, true)
//       const response = await fetch(`/api/sliders/${slider.id}/code/${deployment.id}`)
//       if (response.ok) {
//         const data = await response.json()
//         setViewCodeModal(data)
//       }
//     } catch (error) {
//       console.error("Failed to fetch code:", error)
//     } finally {
//       setDeploymentLoading(deployment.id, false)
//     }
//   }

//   const getPageLabel = (pageType) => {
//     const page = pages.find((p) => p.value === pageType)
//     return page ? page.label : pageType
//   }

//   if (deployments.length === 0) {
//     return (
//       <Card sectioned>
//         <Stack vertical spacing="tight" alignment="center">
//           <Text variant="headingSm">No Deployments Yet</Text>
//           <Text color="subdued">This slider hasn't been added to any theme pages yet.</Text>
//         </Stack>
//       </Card>
//     )
//   }

//   return (
//     <>
//       <Card>
//         <div style={{ padding: "1rem" }}>
//           <Stack vertical spacing="loose">
//             <Stack alignment="center" distribution="equalSpacing">
//               <Text variant="headingSm">Active Deployments ({deployments.length})</Text>
//               <Button size="slim" onClick={fetchDeployments}>
//                 Refresh
//               </Button>
//             </Stack>

//             <Text color="subdued" variant="bodySm">
//               Manage where "{slider.name}" appears on your store
//             </Text>

//             <Stack vertical spacing="tight">
//               {deployments.map((deployment) => {
//                 const isLoading = loadingStates[deployment.id] || false

//                 return (
//                   <Card key={deployment.id} sectioned>
//                     <Stack alignment="center" distribution="equalSpacing">
//                       <Stack vertical spacing="extraTight">
//                         <Stack alignment="center" spacing="tight">
//                           <Badge status={deployment.isActive ? "success" : "critical"}>
//                             {deployment.isActive ? "Live" : "Inactive"}
//                           </Badge>
//                           <Badge status={deployment.isAutoDeployed ? "info" : "warning"}>
//                             {deployment.isAutoDeployed ? "Auto-Deployed" : "Manual"}
//                           </Badge>
//                         </Stack>

//                         <Text variant="headingXs">{deployment.themeName}</Text>

//                         <Stack alignment="center" spacing="tight">
//                           <Text color="subdued" variant="bodySm">
//                             📄 {getPageLabel(deployment.pageType)}
//                           </Text>
//                           <Text color="subdued" variant="bodySm">
//                             📍 {deployment.position} position
//                           </Text>
//                         </Stack>

//                         <Text color="subdued" variant="bodySm">
//                           Template: {deployment.templateName}
//                         </Text>

//                         <Text color="subdued" variant="bodySm">
//                           Deployed:{" "}
//                           {new Date(deployment.createdAt).toLocaleDateString("en-US", {
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </Text>
//                       </Stack>

//                       <Stack vertical spacing="tight">
//                         <Button
//                           size="slim"
//                           destructive
//                           onClick={() => handleRemoveDeployment(deployment.id, deployment)}
//                           loading={isLoading}
//                         >
//                           Remove
//                         </Button>
//                         {!deployment.isAutoDeployed && (
//                           <Button size="slim" onClick={() => handleViewCode(deployment)} loading={isLoading}>
//                             View Code
//                           </Button>
//                         )}
//                       </Stack>
//                     </Stack>
//                   </Card>
//                 )
//               })}
//             </Stack>
//           </Stack>
//         </div>
//       </Card>

//       {/* View Code Modal */}
//       {viewCodeModal && (
//         <Modal
//           open={!!viewCodeModal}
//           onClose={() => setViewCodeModal(null)}
//           title="Manual Integration Code"
//           large
//           primaryAction={{
//             content: "Copy Code",
//             onAction: () => {
//               navigator.clipboard.writeText(viewCodeModal.liquidCode)
//               alert("Code copied to clipboard!")
//             },
//           }}
//           secondaryActions={[
//             {
//               content: "Close",
//               onAction: () => setViewCodeModal(null),
//             },
//           ]}
//         >
//           <Modal.Section>
//             <Stack vertical spacing="loose">
//               <Banner status="info" title="Manual Integration Required">
//                 Since this was a manual deployment, you need to add this code to your theme template yourself.
//               </Banner>

//               <Card sectioned>
//                 <Stack vertical spacing="tight">
//                   <Text variant="headingSm">Instructions</Text>
//                   <Text>{viewCodeModal.instructions}</Text>
//                 </Stack>
//               </Card>

//               <Card sectioned>
//                 <Stack vertical spacing="tight">
//                   <Text variant="headingSm">Code to Add</Text>
//                   <div
//                     style={{
//                       backgroundColor: "#f6f6f7",
//                       padding: "1rem",
//                       borderRadius: "4px",
//                       fontFamily: "monospace",
//                       fontSize: "12px",
//                       whiteSpace: "pre-wrap",
//                       maxHeight: "400px",
//                       overflow: "auto",
//                       border: "1px solid #e1e1e1",
//                     }}
//                   >
//                     {viewCodeModal.liquidCode}
//                   </div>
//                 </Stack>
//               </Card>
//             </Stack>
//           </Modal.Section>
//         </Modal>
//       )}
//     </>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { Modal, Card, Stack, Text, Banner, Button } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function AddToThemeModal({ isOpen, onClose, slider }) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) setCopied(false)
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(slider.id))
      setCopied(true)
      showToast("Slider ID copied")
    } catch {
      showToast("Could not copy automatically. Select the ID and copy manually.", { error: true })
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Embed "${slider?.name || "slider"}"`}
      primaryAction={{ content: "Done", onAction: onClose }}
      secondaryActions={[{ content: "Copy ID", onAction: handleCopy }]}
    >
      <Modal.Section>
        <Stack vertical spacing="loose">
          <Banner status="success" title="Ready to add to your theme">
            Paste this Slider ID into the SlideEase app block in the theme editor.
          </Banner>

          <Card sectioned>
            <Stack vertical spacing="tight">
              <Text variant="headingSm">Slider ID</Text>
              <div
                style={{
                  background: "#f6f6f7",
                  border: "2px solid #008060",
                  borderRadius: 8,
                  padding: "1rem",
                  textAlign: "center",
                  fontFamily: "monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  userSelect: "all",
                }}
              >
                {slider?.id}
              </div>
              <Button onClick={handleCopy}>{copied ? "Copied" : "Copy ID"}</Button>
            </Stack>
          </Card>

          <Card sectioned>
            <Stack vertical spacing="tight">
              <Text variant="headingSm">Setup steps</Text>
              <Text>1. Online Store → Themes → Customize</Text>
              <Text>2. Add section → Apps → SlideEase Slider</Text>
              <Text>3. Paste the Slider ID into the block setting</Text>
              <Text>4. Save and preview your storefront</Text>
            </Stack>
          </Card>

          {(slider?.slides?.length || 0) === 0 && (
            <Banner status="warning" title="No slides yet">
              Add slides before publishing for the best storefront experience.
            </Banner>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  )
}

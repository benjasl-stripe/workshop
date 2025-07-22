import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              ZipScoot
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                Services
              </span>
              <ul className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/store"
                  >
                    Rent a Scooter
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Group Rentals
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Guided Tours
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Delivery Service
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                Support
              </span>
              <ul className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Safety Guidelines
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Legal</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rental Agreement
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-ui-fg-base"
                    href="https://stripe.dev/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Insurance Information
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} ZipScoot, a ZipVolt company. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}

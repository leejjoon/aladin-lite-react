# Testing Strategy for AladinLiteReact

This document outlines the testing strategy for the `AladinLiteReact` component. Given that this is a highly visual, canvas-based component, traditional unit testing with frameworks like Jest is insufficient. Verifying component behavior requires visual confirmation.

Therefore, our primary approach will be **visual regression testing** using a browser automation and snapshot testing tool.

## Core Technology

We will use **Playwright** for our testing. This choice is consistent with the testing strategy already in place for the underlying `aladin-lite` library and is perfectly suited for this task.

Playwright will allow us to:
1.  Programmatically control a real browser.
2.  Navigate to a test page that renders our component.
3.  Take screenshots of the component's visual output.
4.  Compare these screenshots against "golden" reference images to detect any unintended visual changes.

## Implementation Plan

### 1. Create a Dedicated Test Harness Page

A dedicated page will be created within the `example-tailwind` application to serve as a controlled environment for testing the component.

-   **Route:** `/test-harness`
-   **Functionality:**
    -   This page will render a single `AladinLiteReact` component.
    -   It will be designed to read props from the URL's query string and pass them directly to the `AladinLiteReact` component.
    -   This provides a simple and effective way for our tests to control the component's state from the outside.
-   **Example Usage:**
    -   Navigating to `/test-harness?target=M51&fov=1` will render `<AladinLiteReact target="M51" fov={1} />`.
    -   Navigating to `/test-harness?projection=AIT` will render `<AladinLiteReact projection="AIT" />`.

### 2. Set Up Playwright

Playwright will be added as a development dependency to the `example-tailwind` project. The configuration will be set up to:
-   Start the Next.js development server before running tests.
-   Target the `/test-harness` page.
-   Define where to store snapshot images.

### 3. Write the Test Suite

A new test suite file, `tests/props.spec.ts`, will be created. This suite will contain a test case for each prop defined in `props.md`.

The workflow for each test case will be:

1.  **Navigate:** The test will construct a URL with the specific query parameters needed to test a single prop (e.g., `/test-harness?fov=15`).
2.  **Wait:** The test will wait for the Aladin Lite instance to be fully initialized, any animations to complete, and the view to be idle. This is crucial for preventing flaky tests.
3.  **Screenshot:** The test will take a screenshot of the `div` containing the Aladin Lite viewer.
4.  **Compare:** Playwright's `toHaveScreenshot()` assertion will be used to compare the captured image with the reference snapshot stored in the repository.

If the new screenshot does not match the reference, the test will fail, alerting us to an unexpected visual change in the component's output. When a change is intentional (e.g., after a feature is correctly implemented), we will update the reference snapshot.

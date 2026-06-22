import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Banner, { type BannerSeverity } from './Banner'

const severities: Array<[BannerSeverity, 'alert' | 'status']> = [
  ['critical', 'alert'],
  ['warning', 'alert'],
  ['info', 'status'],
  ['success', 'status'],
]

describe('Banner', () => {
  it.each(severities)('maps %s severity to role %s', (severity, role) => {
    render(<Banner severity={severity}>Message</Banner>)

    expect(
      screen.getByRole(role, { name: new RegExp(`${severity}|information`, 'i') })
    ).toHaveTextContent('Message')
  })

  it('renders the title, message, and an aria-hidden severity icon', () => {
    const { container } = render(
      <Banner severity="success" title="Saved">
        Your changes were saved.
      </Banner>
    )

    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()
    expect(container.querySelector('.banner__icon svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders href actions as links', () => {
    render(
      <Banner severity="info" action={{ label: 'Read docs', href: '/docs' }}>
        Learn more.
      </Banner>
    )

    expect(screen.getByRole('link', { name: /read docs/i })).toHaveAttribute('href', '/docs')
  })

  it('renders callback actions as buttons', () => {
    const onClick = vi.fn()
    render(
      <Banner severity="info" action={{ label: 'Retry', onClick }}>
        Try again.
      </Banner>
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('dismisses on click and returns focus to the caller target', async () => {
    const onDismiss = vi.fn()
    const returnFocusRef = { current: document.createElement('button') }
    returnFocusRef.current.textContent = 'Return target'
    document.body.append(returnFocusRef.current)

    render(
      <Banner severity="warning" dismissible onDismiss={onDismiss} returnFocusRef={returnFocusRef}>
        Wallet mismatch.
      </Banner>
    )

    fireEvent.click(screen.getByRole('button', { name: /dismiss banner/i }))

    expect(onDismiss).toHaveBeenCalledOnce()
    await waitFor(() => expect(document.activeElement).toBe(returnFocusRef.current))

    returnFocusRef.current.remove()
  })

  it('dismisses on Escape from the dismiss button', () => {
    const onDismiss = vi.fn()
    render(
      <Banner severity="critical" dismissible onDismiss={onDismiss}>
        Critical warning.
      </Banner>
    )

    fireEvent.keyDown(screen.getByRole('button', { name: /dismiss banner/i }), { key: 'Escape' })

    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

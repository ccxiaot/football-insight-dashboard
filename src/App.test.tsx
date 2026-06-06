import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the dashboard identity', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '足球洞察看板' })).toBeInTheDocument();
  });

  it('renders primary dashboard controls and match cards', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: '赛前观察' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '赛事预测' })).toBeInTheDocument();
    expect(screen.getByText('可结算命中率')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /今天/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /比利时 vs 突尼斯/ })).toBeInTheDocument();
  });

  it('opens match detail from a card', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /比利时 vs 突尼斯/ }));

    expect(screen.getByRole('dialog', { name: /比利时 vs 突尼斯/ })).toBeInTheDocument();
    expect(screen.getByText('概率拆解')).toBeInTheDocument();
    expect(screen.getByText('主 -0.75')).toBeInTheDocument();
  });
});

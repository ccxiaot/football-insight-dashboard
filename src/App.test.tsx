import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the dashboard identity', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '足球洞察看板' })).toBeInTheDocument();
  });

  it('renders primary dashboard controls and match cards', async () => {
    render(<App />);

    expect(screen.getByRole('button', { name: '赛前观察' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '赛事预测' })).toBeInTheDocument();
    expect(await screen.findByText('临场观察')).toBeInTheDocument();
    expect(screen.queryByText('赛事筛选')).not.toBeInTheDocument();
  });

  it('keeps prediction filters on the prediction view', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '赛事预测' }));

    expect(await screen.findByText('可结算命中率')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /全部日期/ })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /比利时 vs 突尼斯/ })).toBeInTheDocument();
    expect(screen.getByText('赛事筛选')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全部分组/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SP 值' })).toBeInTheDocument();
  });

  it('opens match detail from a card', async () => {
    const user = userEvent.setup();
    render(<App />);

    const watchlist = await screen.findByLabelText('赛前观察工作台');
    await user.click(within(watchlist).getByRole('button', { name: /比利时 vs 突尼斯 主胜方向/ }));

    expect(screen.getByRole('dialog', { name: /比利时 vs 突尼斯/ })).toBeInTheDocument();
    expect(screen.getByText('概率拆解')).toBeInTheDocument();
    expect(screen.getByText('主 -0.75')).toBeInTheDocument();
  });
});

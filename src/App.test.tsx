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
    expect(screen.getByText('赛前决策矩阵')).toBeInTheDocument();
    expect(screen.getByText('盘口复核队列')).toBeInTheDocument();
    expect(screen.queryByText('赛事筛选')).not.toBeInTheDocument();
  });

  it('renders a fuller world cup desk', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '世界杯' }));

    expect(await screen.findByText('2026 世界杯专题')).toBeInTheDocument();
    expect(screen.getByText('小组路径预测')).toBeInTheDocument();
    expect(screen.getByText('淘汰赛路径')).toBeInTheDocument();
    expect(screen.getByText('冠军候选观察')).toBeInTheDocument();
    expect(screen.getByText('世界杯观察场次')).toBeInTheDocument();
  });

  it('keeps prediction filters on the prediction view', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '赛事预测' }));

    expect(await screen.findByText('可结算命中率')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /全部日期/ })).toBeInTheDocument();
    expect(screen.getByText('赛事筛选')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全部分组/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SP 值' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /国际友谊赛预测表/ })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: '胜平负 / 让球' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('columnheader', { name: '1X2' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('columnheader', { name: '总进球' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('columnheader', { name: 'BEST' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /查看 比利时 vs 突尼斯/ })).toBeInTheDocument();
  });

  it('opens match detail from a card', async () => {
    const user = userEvent.setup();
    render(<App />);

    const watchlist = await screen.findByLabelText('赛前观察工作台');
    await user.click(within(watchlist).getByRole('button', { name: /比利时 vs 突尼斯 主胜方向/ }));

    expect(screen.getByRole('dialog', { name: /比利时 vs 突尼斯/ })).toBeInTheDocument();
    expect(screen.getByText('概率拆解')).toBeInTheDocument();
    expect(screen.getByText('预测市场')).toBeInTheDocument();
    expect(screen.getByText('模型深度解析')).toBeInTheDocument();
    expect(screen.getByText('比分热区')).toBeInTheDocument();
    expect(screen.getByText('风险复核')).toBeInTheDocument();
    expect(screen.getByText('主 -0.75')).toBeInTheDocument();
  });
});

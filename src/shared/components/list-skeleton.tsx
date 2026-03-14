'use client';

import { FC } from 'react';

import { Card, CardVariant, CardPadding } from './card';
import './styles/list-skeleton.css';

type Props = {
  rows?: number;
};

export const ListSkeleton: FC<Props> = ({ rows = 3 }) => {
  return (
    <div className="list-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} variant={CardVariant.DEFAULT} padding={CardPadding.MD}>
          <div className="list-skeleton__item" />
          <div className="list-skeleton__item-sub" />
          <div className="list-skeleton__item-action" />
        </Card>
      ))}
    </div>
  );
};

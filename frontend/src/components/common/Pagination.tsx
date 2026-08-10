import React from 'react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹ Prev</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next ›</button>
    </div>
  );
};

export default Pagination;

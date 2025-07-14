"use client";

import { useState, useEffect, useRef, useMemo, ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtual scrolling component for large lists
 * Renders only visible items for better performance
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Optimized grid component with virtual scrolling
 */
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  className
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight, offsetY, columnsPerRow } = useMemo(() => {
    const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rowHeight = itemHeight + gap;
    const totalRows = Math.ceil(items.length / columnsPerRow);
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + 1
    );

    const visibleItems = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        if (index < items.length) {
          visibleItems.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }

    return {
      visibleItems,
      totalHeight: totalRows * rowHeight,
      offsetY: startRow * rowHeight,
      columnsPerRow
    };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, scrollTop, gap]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: col * (itemWidth + gap),
                top: (row * (itemHeight + gap)) - offsetY,
                width: itemWidth,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Infinite scroll component with performance optimization
 */
interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  className?: string;
  loadingComponent?: ReactNode;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  threshold = 200,
  className,
  loadingComponent
}: InfiniteScrollProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const loadingElement = loadingRef.current;
    
    if (!container || !loadingElement || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && !isLoading && !isLoadingMore) {
          setIsLoadingMore(true);
          try {
            await loadMore();
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      {
        root: container,
        rootMargin: `${threshold}px`
      }
    );

    observer.observe(loadingElement);

    return () => {
      observer.unobserve(loadingElement);
    };
  }, [loadMore, hasMore, isLoading, isLoadingMore, threshold]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
    </div>
  );

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasMore && (
        <div ref={loadingRef}>
          {(isLoading || isLoadingMore) && (loadingComponent || defaultLoadingComponent)}
        </div>
      )}
    </div>
  );
}

/**
 * Optimized table component with virtual scrolling
 */
interface VirtualTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    width: number;
    render?: (value: any, item: T, index: number) => ReactNode;
  }>;
  rowHeight: number;
  containerHeight: number;
  className?: string;
}

export function VirtualTable<T>({
  data,
  columns,
  rowHeight,
  containerHeight,
  className
}: VirtualTableProps<T>) {
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const renderRow = (item: T, index: number) => (
    <div className="flex border-b" style={{ height: rowHeight }}>
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className="flex items-center px-2 border-r"
          style={{ width: column.width, minWidth: column.width }}
        >
          {column.render 
            ? column.render(item[column.key], item, index)
            : String(item[column.key])
          }
        </div>
      ))}
    </div>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex border-b-2 font-semibold bg-muted" style={{ height: rowHeight }}>
        {columns.map((column) => (
          <div
            key={String(column.key)}
            className="flex items-center px-2 border-r"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Virtual scrolling body */}
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight - rowHeight}
        renderItem={renderRow}
      />
    </div>
  );
}

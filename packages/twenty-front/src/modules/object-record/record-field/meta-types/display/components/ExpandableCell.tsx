import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { Chip, ChipVariant, IconPencil } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledChipContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledChildContainer = styled.div<{
  shrink: number;
  isVisible?: boolean;
  isHovered?: boolean;
}>`
  flex-shrink: ${({ shrink }) => shrink};
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  overflow: ${({ isHovered }) => (isHovered ? 'hidden' : 'none')};
`;

export const ExpandableCell = ({
  children,
  isHovered,
}: {
  children: ReactElement[];
  isHovered?: boolean;
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [childrenContainerWidth, setChildrenContainerWidth] = useState<
    Record<number, number>
  >({});

  const chipContainerWidth = 52;

  const computeChildProperties = (index: number) => {
    const availableWidth = containerWidth - chipContainerWidth;
    const childWidth = childrenContainerWidth[index];
    const cumulatedChildrenWidth = Array.from(Array(index).keys()).reduce(
      (acc, currentIndex) => acc + childrenContainerWidth[currentIndex],
      0,
    );
    if (!isHovered) {
      return { shrink: 1, isVisible: true };
    }
    if (cumulatedChildrenWidth > availableWidth) {
      return { shrink: 1, isVisible: false };
    }
    if (cumulatedChildrenWidth + childWidth <= availableWidth) {
      return { shrink: 0, isVisible: true };
    }
    return { shrink: 1, isVisible: true };
  };

  const computeHiddenChildrenNumber = () => {
    const childrenContainerWidthValues = Object.values(childrenContainerWidth);
    let result = 0;
    let cumulatedWidth = 0;
    childrenContainerWidthValues.forEach((childrenContainerWidthValue) => {
      cumulatedWidth += childrenContainerWidthValue;
      if (cumulatedWidth > containerWidth - chipContainerWidth) {
        result += 1;
      }
    });
    return Math.max(result - 1, 0);
  };

  const hiddenChildrenCount = computeHiddenChildrenNumber();

  return (
    <StyledContainer
      ref={(el) => {
        if (!el || containerWidth > 0) return;
        setContainerWidth(el.getBoundingClientRect().width);
      }}
    >
      <StyledChildrenContainer>
        {children.map((child, index) => {
          const childProperties = computeChildProperties(index);
          return (
            <StyledChildContainer
              ref={(el) => {
                if (!el || childrenContainerWidth[index] > 0) return;
                setChildrenContainerWidth((prevState) => {
                  prevState[index] = el.getBoundingClientRect().width;
                  return prevState;
                });
              }}
              key={index}
              isHovered={isHovered}
              isVisible={childProperties.isVisible}
              shrink={childProperties.shrink}
            >
              {child}
            </StyledChildContainer>
          );
        })}
      </StyledChildrenContainer>
      {isHovered && (
        <StyledChipContainer>
          {hiddenChildrenCount > 0 && (
            <Chip
              label={`+${hiddenChildrenCount}`}
              variant={ChipVariant.Highlighted}
            />
          )}
          <FloatingIconButton Icon={IconPencil} />
        </StyledChipContainer>
      )}
    </StyledContainer>
  );
};
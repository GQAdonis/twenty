import { ReactElement, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { Chip, ChipVariant } from 'twenty-ui';

import { AnimationDivProps } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton.tsx';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu.tsx';

const SPACING = 1;
const GAP_WIDTH = 4 * SPACING;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(SPACING)};
  justify-content: space-between;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(SPACING)};
  overflow: hidden;
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

const StyledRelationsListContainer = styled.div`
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  box-shadow: '0px 2px 4px ${({ theme }) =>
    theme.boxShadow.light}, 2px 4px 16px ${({ theme }) =>
    theme.boxShadow.strong}';
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledAnimatedChipContainer = styled(motion.div)``;

export type ExpandableListProps = {
  isHovered?: boolean;
  reference?: HTMLDivElement;
};

export const ExpandableList = ({
  children,
  isHovered,
  reference,
}: {
  children: ReactElement[];
} & ExpandableListProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const [childrenWidths, setChildrenWidths] = useState<Record<number, number>>(
    {},
  );

  // Because Chip width depends on the number of hidden children which depends on the Chip width, we have a circular dependency
  // To avoid it, we fix the Chip width and make sure it can display its content (a number greater than 1)
  const getChipContentWidth = () => {
    if (children.length <= 1) {
      return 0;
    }
    if (children.length <= 10) {
      return 17;
    }
    if (children.length <= 100) {
      return 17 + 8;
    }
    if (children.length <= 1000) {
      return 17 + 8 * 2;
    }
    return 17 + 8 * (Math.trunc(Math.log10(children.length)) - 1);
  };

  const chipContainerWidth = getChipContentWidth() + 2 * 4; // Because Chip component has a 4px padding
  const availableWidth = containerWidth - (chipContainerWidth + GAP_WIDTH); // Because there is a 4px gap between children and chipContainer

  const computeChildProperties = (index: number) => {
    const childWidth = childrenWidths[index];
    const cumulatedChildrenWidth = Array.from(Array(index).keys()).reduce(
      (acc, currentIndex) => acc + childrenWidths[currentIndex] + GAP_WIDTH, // Because there is a 4px gap between children
      0,
    );
    if (!isHovered) {
      return { shrink: 1, isVisible: true };
    }
    if (cumulatedChildrenWidth > availableWidth) {
      return { shrink: 1, isVisible: false };
    }
    if (cumulatedChildrenWidth + childWidth + GAP_WIDTH <= availableWidth) {
      // Because there is a 4px gap between children
      return { shrink: 0, isVisible: true };
    }
    return { shrink: 1, isVisible: true };
  };

  const computeHiddenChildrenNumber = () => {
    const childrenContainerWidthValues = Object.values(childrenWidths);
    let result = 0;
    let cumulatedWidth = 0;
    childrenContainerWidthValues.forEach((childrenContainerWidthValue) => {
      cumulatedWidth += childrenContainerWidthValue + GAP_WIDTH; // Because there is a 4px gap between children
      if (cumulatedWidth > availableWidth) {
        result += 1;
      }
    });
    return Math.max(result - 1, 0);
  };

  const hiddenChildrenCount = computeHiddenChildrenNumber();

  const { refs, floatingStyles } = useFloating({
    // @ts-expect-error placement accepts 'start' as value even if the typing does not permit it
    placement: 'start',
    elements: { reference },
  });

  const openDropdownMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownMenuOpen(true);
  };
  useEffect(() => {
    if (!isHovered) {
      setIsDropdownMenuOpen(false);
    }
  }, [isHovered]);

  return (
    <StyledContainer
      ref={(el) => {
        if (!el) return;
        setContainerWidth(el.getBoundingClientRect().width);
      }}
    >
      <StyledChildrenContainer>
        {children.map((child, index) => {
          const childProperties = computeChildProperties(index);
          return (
            <StyledChildContainer
              ref={(el) => {
                if (!el) return;
                setChildrenWidths((prevState) => {
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
      {isHovered && hiddenChildrenCount > 0 && (
        <StyledAnimatedChipContainer
          initial={AnimationDivProps.initial}
          animate={AnimationDivProps.animate}
          transition={AnimationDivProps.transition}
          whileHover={AnimationDivProps.whileHover}
        >
          <Chip
            label={`+${hiddenChildrenCount}`}
            variant={ChipVariant.Highlighted}
            onClick={openDropdownMenu}
            width={getChipContentWidth()}
          />
        </StyledAnimatedChipContainer>
      )}
      {isDropdownMenuOpen && (
        <DropdownMenu
          ref={refs.setFloating}
          style={floatingStyles}
          width={
            reference
              ? Math.max(220, reference.getBoundingClientRect().width)
              : undefined
          }
        >
          <StyledRelationsListContainer>
            {children}
          </StyledRelationsListContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
};

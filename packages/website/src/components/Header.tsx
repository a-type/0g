import * as React from 'react';
import { Flex, Text } from 'rebass';

export function Header() {
  return (
    <Flex as="header" px={2} alignItems="center">
      <Text fontFamily="'Major Mono Display'" p={2}>
        0G
      </Text>
    </Flex>
  );
}
